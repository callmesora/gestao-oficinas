#![cfg_attr(target_os = "windows", windows_subsystem = "windows")]

#[cfg(not(target_os = "windows"))]
fn main() {
    eprintln!("Windows only");
}

#[cfg(target_os = "windows")]
mod windows {
    use gestao_oficinas_lib::windows_private::{
        create_private_directory, verify_private_directory,
    };
    use rfd::{FileDialog, MessageDialog, MessageLevel};
    use std::{
        ffi::OsStr,
        io::{self, BufRead, BufReader, Read, Write},
        net::TcpStream,
        os::windows::{
            ffi::OsStrExt,
            fs::{MetadataExt, OpenOptionsExt},
            process::CommandExt,
        },
        path::{Path, PathBuf},
        process::{Child, ChildStdout, Command, Stdio},
        thread,
        time::{Duration, Instant, SystemTime, UNIX_EPOCH},
    };
    use windows_sys::Win32::Storage::FileSystem::{
        FILE_ATTRIBUTE_REPARSE_POINT, FILE_FLAG_OPEN_REPARSE_POINT, MoveFileW,
    };

    const HIDDEN: u32 = 0x0800_0000; // CREATE_NO_WINDOW
    const TITLE: &str = "Gestão de Oficinas";

    fn message(text: &str, level: MessageLevel) {
        MessageDialog::new()
            .set_title(TITLE)
            .set_description(text)
            .set_level(level)
            .show();
    }
    fn failed() -> io::Error {
        io::Error::other("customer launcher operation failed")
    }
    fn clean_environment(command: &mut Command) {
        for (name, _) in std::env::vars_os() {
            let key = name.to_string_lossy().to_ascii_uppercase();
            if ["WORKSHOP_", "GESTAO_", "NODE_", "PG", "PLAYWRIGHT_"]
                .iter()
                .any(|prefix| key.starts_with(prefix))
            {
                command.env_remove(name);
            }
        }
    }
    fn command(file: &Path, directory: &Path) -> Command {
        let mut result = Command::new(file);
        result.current_dir(directory).creation_flags(HIDDEN);
        clean_environment(&mut result);
        // The installer places the redistributable runtime beside the launcher.
        // PostgreSQL runs from a nested directory, so let its child processes
        // find those DLLs without requiring a machine-wide installation.
        if let Some(application_dir) = directory.parent() {
            let paths = std::iter::once(application_dir.to_path_buf()).chain(
                std::env::var_os("PATH")
                    .into_iter()
                    .flat_map(|value| std::env::split_paths(&value).collect::<Vec<_>>()),
            );
            if let Ok(path) = std::env::join_paths(paths) {
                result.env("PATH", path);
            }
        }
        result
    }
    fn marker(child: &mut Child) -> io::Result<BufReader<ChildStdout>> {
        let mut reader = BufReader::new(child.stdout.take().ok_or_else(failed)?);
        let mut line = String::new();
        reader.by_ref().take(16).read_line(&mut line)?;
        if line != "READY\n" {
            return Err(failed());
        }
        Ok(reader)
    }
    fn setup_acknowledgement(output: ChildStdout) -> std::sync::mpsc::Receiver<bool> {
        let (send, receive) = std::sync::mpsc::sync_channel(1);
        thread::spawn(move || {
            let mut reader = BufReader::new(output);
            let mut acknowledged = false;
            loop {
                let mut line = String::new();
                match reader.by_ref().take(256).read_line(&mut line) {
                    Ok(0) | Err(_) => break,
                    Ok(_) if !acknowledged && line == "SETUP_IPC_READY\n" => {
                        let _ = send.send(true);
                        acknowledged = true;
                    }
                    Ok(_) => {}
                }
            }
            if !acknowledged {
                let _ = send.send(false);
            }
        });
        receive
    }
    fn await_owned_event(
        host: &mut Child,
        client: &mut Child,
        receive: &std::sync::mpsc::Receiver<bool>,
        timeout: Option<Duration>,
    ) -> io::Result<bool> {
        let deadline = timeout.map(|duration| Instant::now() + duration);
        loop {
            if !matches!(host.try_wait(), Ok(None)) {
                let _ = client.kill();
                let _ = client.wait();
                return Err(failed());
            }
            match client.try_wait() {
                Ok(None) => {}
                Ok(Some(_)) => return Err(failed()),
                Err(_) => {
                    let _ = client.kill();
                    let _ = client.wait();
                    return Err(failed());
                }
            }
            if deadline.is_some_and(|time| Instant::now() >= time) {
                return Ok(false);
            }
            match receive.recv_timeout(Duration::from_millis(200)) {
                Ok(value) => return Ok(value),
                Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => return Ok(false),
                Err(std::sync::mpsc::RecvTimeoutError::Timeout) => {}
            }
        }
    }
    struct OwnedHost {
        child: Child,
        _output: BufReader<ChildStdout>,
    }
    impl Drop for OwnedHost {
        fn drop(&mut self) {
            drop(self.child.stdin.take());
            let _ = self.child.wait();
        }
    }
    fn move_fresh(source: &Path, target: &Path) -> io::Result<()> {
        fn wide(value: &OsStr) -> Vec<u16> {
            value.encode_wide().chain([0]).collect()
        }
        let source = wide(source.as_os_str());
        let target = wide(target.as_os_str());
        // MoveFileW never replaces an existing target. Both names are in the guarded parent.
        if unsafe { MoveFileW(source.as_ptr(), target.as_ptr()) } == 0 {
            return Err(io::Error::last_os_error());
        }
        Ok(())
    }
    fn read_setup_token(path: &Path) -> io::Result<Vec<u8>> {
        let file = std::fs::OpenOptions::new()
            .read(true)
            .custom_flags(FILE_FLAG_OPEN_REPARSE_POINT)
            .open(path)?;
        let metadata = file.metadata()?;
        if !metadata.is_file()
            || metadata.file_attributes() & FILE_ATTRIBUTE_REPARSE_POINT != 0
            || metadata.len() > 65
        {
            return Err(failed());
        }
        let mut token = Vec::new();
        file.take(66).read_to_end(&mut token)?;
        if token.last() == Some(&b'\n') {
            token.pop();
        }
        if token.len() != 64
            || !token
                .iter()
                .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(byte))
        {
            return Err(failed());
        }
        Ok(token)
    }
    fn enrollment_available(port: u16) -> io::Result<bool> {
        let mut socket = TcpStream::connect_timeout(
            &std::net::SocketAddr::from(([127, 0, 0, 1], port)),
            Duration::from_secs(5),
        )?;
        socket.set_read_timeout(Some(Duration::from_secs(5)))?;
        socket.write_all(b"POST /api/auth/status HTTP/1.1\r\nHost: 127.0.0.1:3210\r\nContent-Type: application/json\r\nContent-Length: 2\r\nConnection: close\r\n\r\n{}")?;
        let mut bytes = Vec::new();
        socket.take(16385).read_to_end(&mut bytes)?;
        if bytes.len() > 16384 {
            return Err(failed());
        }
        let response = String::from_utf8(bytes).map_err(|_| failed())?;
        let (headers, body) = response.split_once("\r\n\r\n").ok_or_else(failed)?;
        if !headers.starts_with("HTTP/1.1 200 ") {
            return Err(failed());
        }
        let status: serde_json::Value = serde_json::from_str(body).map_err(|_| failed())?;
        if status["kind"] != "ready"
            || !status["setupRequired"].is_boolean()
            || !status["setupAvailable"].is_boolean()
        {
            return Err(failed());
        }
        Ok(status["setupRequired"] == true && status["setupAvailable"] == true)
    }
    // Discovery is intentionally limited to the selected folder and one
    // known child/parent. A unique filename is not proof of compatibility;
    // the official exporter and reconciliation still validate the import.
    fn discovery_directory(path: &Path) -> bool {
        for part in path.ancestors() {
            let Ok(metadata) = std::fs::symlink_metadata(part) else {
                return false;
            };
            if !metadata.is_dir() || metadata.file_attributes() & FILE_ATTRIBUTE_REPARSE_POINT != 0
            {
                return false;
            }
        }
        true
    }
    fn data_folder(selected: &Path) -> Option<PathBuf> {
        fn contains_business_files(path: &Path) -> bool {
            if !discovery_directory(path) {
                return false;
            }
            let Ok(entries) = std::fs::read_dir(path) else {
                return false;
            };
            let mut customers = false;
            let mut vehicles = false;
            for entry in entries.flatten() {
                if !entry.file_type().is_ok_and(|kind| kind.is_file()) {
                    continue;
                }
                let name = entry.file_name();
                customers |= name.eq_ignore_ascii_case("clientes.fic");
                vehicles |= name.eq_ignore_ascii_case("viaturas.fic");
            }
            customers && vehicles
        }
        let child = selected.join("Exe");
        let child_is_directory =
            std::fs::symlink_metadata(&child).is_ok_and(|metadata| metadata.file_type().is_dir());
        let mut found = Vec::new();
        if contains_business_files(selected) {
            found.push(selected.to_path_buf());
        }
        if child_is_directory && contains_business_files(&child) {
            found.push(child);
        }
        if found.len() == 1 { found.pop() } else { None }
    }
    fn analysis_file(data: &Path) -> Option<PathBuf> {
        let mut candidates = Vec::new();
        for directory in std::iter::once(data).chain(data.parent()) {
            // If either directory cannot be read, uniqueness is unknown.
            if !discovery_directory(directory) {
                return None;
            }
            let entries = std::fs::read_dir(directory).ok()?;
            for entry in entries {
                let entry = entry.ok()?;
                if entry.file_type().ok()?.is_file()
                    && entry
                        .path()
                        .extension()
                        .is_some_and(|ext| ext.eq_ignore_ascii_case("wdd"))
                {
                    candidates.push(entry.path());
                }
            }
        }
        if candidates.len() == 1 {
            candidates.pop()
        } else {
            None
        }
    }
    fn export_snapshot(
        runtime: &Path,
        node: &Path,
        parent: &Path,
        data: &Path,
        analysis: &Path,
        progress: &impl Fn(&'static str),
    ) -> io::Result<PathBuf> {
        let id = format!(
            "{:032x}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|_| failed())?
                .as_nanos()
        );
        let system = PathBuf::from(std::env::var_os("SystemRoot").ok_or_else(failed)?);
        let powershell = system.join("SysWOW64/WindowsPowerShell/v1.0/powershell.exe");
        let script = runtime.join("scripts/windows/customer-export.ps1");
        let status = command(&powershell, runtime)
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "RemoteSigned",
                "-File",
            ])
            .arg(script)
            .arg("-Data")
            .arg(data)
            .arg("-Analysis")
            .arg(analysis)
            .arg("-Workspace")
            .arg(parent)
            .arg("-Id")
            .arg(&id)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()?;
        if !status.success() {
            return Err(failed());
        }
        progress("convert");
        let work = parent.join("analysis-local");
        let source = work.join(format!("hfsql-ansi-{id}"));
        let output = work.join(format!("converted-{id}"));
        let mut child = command(node, runtime)
            .args([
                "--import",
                "tsx",
                "apps/server/src/local/desktop-convert.ts",
                "--source",
            ])
            .arg(source)
            .arg("--output")
            .arg(&output)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()?;
        let result = marker(&mut child);
        if result.is_err() {
            drop(child.stdin.take());
            let _ = child.wait();
            return Err(failed());
        }
        if !child.wait()?.success() {
            return Err(failed());
        }
        Ok(output.join("data.sqlite"))
    }
    fn setup_snapshot(
        runtime: &Path,
        node: &Path,
        browser: &Path,
        parent: &Path,
        profile: &Path,
        snapshot: Option<PathBuf>,
    ) -> io::Result<()> {
        let stamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|_| failed())?
            .as_nanos();
        let staging = parent.join(format!("setup-{}-{stamp}", std::process::id()));
        let mut cmd = command(node, runtime);
        cmd.args([
            "--import",
            "tsx",
            "apps/server/src/local/desktop-setup.ts",
            "--profile",
        ])
        .arg(&staging)
        .arg("--browser")
        .arg(browser);
        if let Some(path) = snapshot {
            cmd.arg("--snapshot").arg(path);
        }
        let mut child = cmd
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()?;
        let result = marker(&mut child);
        if result.is_err() {
            drop(child.stdin.take());
            let _ = child.wait();
            return Err(failed());
        }
        let status = child.wait()?;
        if !status.success() {
            return Err(failed());
        }
        move_fresh(&staging, profile)?;
        Ok(())
    }
    include!("migration_wizard.rs");
    pub fn run() -> io::Result<()> {
        let executable = std::env::current_exe()?;
        let folder = executable.parent().ok_or_else(failed)?;
        let runtime = folder.join("service");
        let node = runtime.join("runtime/node.exe");
        let browser = runtime.join("runtime/chromium/chrome-headless-shell.exe");
        let app = folder.join("gestao-oficinas.exe");
        if !node.is_file() || !browser.is_file() || !app.is_file() {
            return Err(failed());
        }
        let local = PathBuf::from(std::env::var_os("LOCALAPPDATA").ok_or_else(failed)?);
        let parent = local.join("GestaoOficinasTrial");
        let _guard = if parent.exists() {
            verify_private_directory(&parent)?
        } else {
            create_private_directory(&parent)?
        };
        let profile = parent.join("profile");
        if !profile.exists() && !wizard::run(&runtime, &node, &browser, &parent, &profile)? {
            return Ok(());
        }
        // The bundled client is configured for this exact loopback port. Refuse
        // an imported or altered profile pointing elsewhere before starting it.
        let config_path = profile.join("profile.json");
        if std::fs::metadata(&config_path)?.len() > 4096 {
            return Err(failed());
        }
        let profile_bytes = std::fs::read(config_path)?;
        if profile_bytes.len() > 4096 {
            return Err(failed());
        }
        let configuration: serde_json::Value =
            serde_json::from_slice(&profile_bytes).map_err(|_| failed())?;
        if configuration["apiPort"] != 3210 {
            return Err(failed());
        }
        // A profile may have been created by an earlier portable installation.
        // Rebind only after the bundled report browser passes its offline check.
        let mut reports = command(&node, &runtime)
            .args([
                "--import",
                "tsx",
                "apps/server/src/local/desktop-report.ts",
                "--profile",
            ])
            .arg(&profile)
            .arg("--browser")
            .arg(&browser)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()?;
        let report_result = marker(&mut reports);
        drop(reports.stdin.take());
        let report_status = reports.wait()?;
        if report_result.is_err() || !report_status.success() {
            return Err(failed());
        }
        let mut host = command(&node, &runtime)
            .args([
                "--import",
                "tsx",
                "apps/server/src/local/desktop-host.ts",
                "--profile",
            ])
            .arg(&profile)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()?;
        let output = match marker(&mut host) {
            Ok(output) => output,
            Err(_) => {
                drop(host.stdin.take());
                let _ = host.wait();
                return Err(failed());
            }
        };
        let mut host = OwnedHost {
            child: host,
            _output: output,
        };
        let needs_enrollment = enrollment_available(3210)?;
        let token = if needs_enrollment {
            Some(read_setup_token(&profile.join("operator-token"))?)
        } else {
            None
        };
        if host.child.try_wait()?.is_some() {
            return Err(failed());
        }
        let mut client_command = Command::new(app);
        client_command
            .current_dir(folder)
            .env_remove("GESTAO_SETUP_PIPE")
            .stdin(Stdio::null());
        if token.is_some() {
            client_command
                .env("GESTAO_SETUP_PIPE", "1")
                .stdin(Stdio::piped())
                .stdout(Stdio::piped());
        }
        let client_result = match client_command.spawn() {
            Ok(mut client) => {
                if let Some(token) = token {
                    let sent = client
                        .stdin
                        .take()
                        .ok_or_else(failed)
                        .and_then(|mut pipe| pipe.write_all(&token));
                    // Drain output even if an older client closed its input;
                    // a full output pipe must not stall the recovery path.
                    let acknowledged = if let Some(output) = client.stdout.take() {
                        let receive = setup_acknowledgement(output);
                        await_owned_event(
                            &mut host.child,
                            &mut client,
                            &receive,
                            Some(Duration::from_secs(20)),
                        )? && sent.is_ok()
                    } else {
                        false
                    };
                    if !acknowledged {
                        if !matches!(client.try_wait(), Ok(None)) {
                            let _ = client.kill();
                            let _ = client.wait();
                            return Err(failed());
                        }
                        let (send, receive) = std::sync::mpsc::sync_channel(1);
                        thread::spawn(move || {
                            message(
                                "A preparação automática do acesso demorou mais do que o esperado. Se a aplicação pedir um código de configuração, copie o código que será aberto no Bloco de Notas; caso contrário, continue normalmente.",
                                MessageLevel::Info,
                            );
                            let _ = send.send(true);
                        });
                        if !await_owned_event(&mut host.child, &mut client, &receive, None)? {
                            let _ = client.kill();
                            let _ = client.wait();
                            return Err(failed());
                        }
                        let system =
                            PathBuf::from(std::env::var_os("SystemRoot").ok_or_else(failed)?)
                                .join("System32/notepad.exe");
                        if Command::new(system)
                            .arg(profile.join("operator-token"))
                            .spawn()
                            .is_err()
                        {
                            let _ = client.kill();
                            let _ = client.wait();
                            return Err(failed());
                        }
                    }
                }
                loop {
                    if !matches!(host.child.try_wait(), Ok(None)) {
                        // This handle is the exact client launched above, never a discovered PID.
                        let _ = client.kill();
                        let _ = client.wait();
                        break Err(failed());
                    }
                    match client.try_wait() {
                        Ok(Some(status)) => break Ok(status),
                        Ok(None) => {}
                        Err(error) => {
                            let _ = client.kill();
                            let _ = client.wait();
                            break Err(error);
                        }
                    }
                    thread::sleep(Duration::from_millis(250));
                }
            }
            Err(error) => Err(error),
        };
        drop(host.child.stdin.take());
        let status = host.child.wait();
        if !client_result?.success() || !status?.success() {
            return Err(failed());
        }
        Ok(())
    }
    pub fn main() {
        if run().is_err() {
            message(
                "Não foi possível iniciar a aplicação ou preparar a base de dados. Verifique se o programa antigo está fechado, se as portas locais 3210 e 54329 estão livres e, para importação HFSQL, se o driver ODBC HFSQL 28 de 32 bits e a análise .WDD estão disponíveis. Os dados existentes foram preservados. Contacte o responsável pela instalação.",
                MessageLevel::Error,
            );
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use std::{fs, net::TcpListener};

        #[test]
        fn discovers_only_unambiguous_legacy_data_and_analysis() {
            let root = std::env::temp_dir().join(format!(
                "gestao-discovery-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            let data = root.join("Exe");
            fs::create_dir_all(&data).unwrap();
            fs::write(data.join("Clientes.fic"), b"").unwrap();
            fs::write(data.join("Viaturas.fic"), b"").unwrap();
            let analysis = root.join("GestaoOficinas.wdd");
            fs::write(&analysis, b"").unwrap();
            assert_eq!(data_folder(&root), Some(data.clone()));
            assert_eq!(data_folder(&data), Some(data.clone()));
            assert_eq!(analysis_file(&data), Some(analysis.clone()));
            fs::write(data.join("Other.WDD"), b"").unwrap();
            assert_eq!(analysis_file(&data), None);
            fs::remove_file(data.join("Other.WDD")).unwrap();
            fs::remove_file(&analysis).unwrap();
            assert_eq!(analysis_file(&data), None);
            fs::write(root.join("Clientes.fic"), b"").unwrap();
            fs::write(root.join("Viaturas.fic"), b"").unwrap();
            assert_eq!(data_folder(&root), None);
            fs::remove_dir_all(root).unwrap();
        }

        #[test]
        fn setup_file_accepts_only_the_bounded_token_format() {
            let root = std::env::temp_dir().join(format!(
                "gestao-token-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            fs::create_dir(&root).unwrap();
            let path = root.join("operator-token");
            fs::write(&path, format!("{}\n", "a".repeat(64))).unwrap();
            assert_eq!(read_setup_token(&path).unwrap(), b"a".repeat(64));
            fs::write(&path, "a".repeat(66)).unwrap();
            assert!(read_setup_token(&path).is_err());
            fs::write(&path, "z".repeat(64)).unwrap();
            assert!(read_setup_token(&path).is_err());
            fs::remove_dir_all(root).unwrap();
        }

        #[test]
        fn launcher_recognizes_only_the_exact_ipc_acknowledgement() {
            for (text, expected) in [("SETUP_IPC_READY", true), ("OTHER", false)] {
                let system = PathBuf::from(std::env::var_os("SystemRoot").unwrap())
                    .join("System32/WindowsPowerShell/v1.0/powershell.exe");
                let command = format!("[Console]::Out.Write('{text}' + [char]10)");
                let mut child = Command::new(system)
                    .args(["-NoProfile", "-Command", &command])
                    .creation_flags(HIDDEN)
                    .stdout(Stdio::piped())
                    .spawn()
                    .unwrap();
                let output = child.stdout.take().unwrap();
                assert_eq!(
                    setup_acknowledgement(output)
                        .recv_timeout(Duration::from_secs(5))
                        .unwrap(),
                    expected
                );
                assert!(child.wait().unwrap().success());
            }
        }

        #[test]
        fn service_exit_closes_owned_client_during_ack_or_fallback_wait() {
            let system = PathBuf::from(std::env::var_os("SystemRoot").unwrap())
                .join("System32/WindowsPowerShell/v1.0/powershell.exe");
            for timeout in [Some(Duration::from_secs(20)), None] {
                let mut host = Command::new(&system)
                    .args(["-NoProfile", "-Command", "Start-Sleep -Milliseconds 800"])
                    .creation_flags(HIDDEN)
                    .spawn()
                    .unwrap();
                let mut client = Command::new(&system)
                    .args(["-NoProfile", "-Command", "Start-Sleep -Seconds 30"])
                    .creation_flags(HIDDEN)
                    .spawn()
                    .unwrap();
                let (_send, receive) = std::sync::mpsc::sync_channel(1);
                let began = Instant::now();
                assert!(await_owned_event(&mut host, &mut client, &receive, timeout).is_err());
                assert!(began.elapsed() < Duration::from_secs(8));
                assert!(client.try_wait().unwrap().is_some());
                let _ = host.wait();
            }
        }

        #[test]
        fn enrollment_prompt_only_when_server_reports_setup_available() {
            for (body, expected) in [
                (
                    r#"{"kind":"ready","setupRequired":true,"setupAvailable":true}"#,
                    Some(true),
                ),
                (
                    r#"{"kind":"ready","setupRequired":false,"setupAvailable":false}"#,
                    Some(false),
                ),
                (r#"{"kind":"ready"}"#, None),
            ] {
                let listener = TcpListener::bind("127.0.0.1:0").unwrap();
                let port = listener.local_addr().unwrap().port();
                let server = thread::spawn(move || {
                    let (mut client, _) = listener.accept().unwrap();
                    let mut request = [0u8; 1024];
                    let _ = client.read(&mut request).unwrap();
                    write!(
                        client,
                        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                        body.len(),
                        body
                    )
                    .unwrap();
                });
                let result = enrollment_available(port);
                server.join().unwrap();
                match expected {
                    Some(value) => assert_eq!(result.unwrap(), value),
                    None => assert!(result.is_err()),
                }
            }
        }

        #[test]
        fn profile_promotion_never_replaces_existing_data() {
            let root = std::env::temp_dir().join(format!(
                "gestao-promotion-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            fs::create_dir(&root).unwrap();
            let source = root.join("source");
            let target = root.join("target");
            fs::create_dir(&source).unwrap();
            fs::write(source.join("marker"), b"new").unwrap();
            fs::create_dir(&target).unwrap();
            fs::write(target.join("marker"), b"old").unwrap();
            assert!(move_fresh(&source, &target).is_err());
            assert_eq!(fs::read(source.join("marker")).unwrap(), b"new");
            assert_eq!(fs::read(target.join("marker")).unwrap(), b"old");
            let other = root.join("other");
            move_fresh(&source, &other).unwrap();
            assert_eq!(fs::read(other.join("marker")).unwrap(), b"new");
            fs::remove_dir_all(root).unwrap();
        }
    }
}

#[cfg(target_os = "windows")]
fn main() {
    windows::main();
}
