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
    use rfd::{FileDialog, MessageButtons, MessageDialog, MessageDialogResult, MessageLevel};
    use std::{
        ffi::OsStr,
        io::{self, BufRead, BufReader, Read, Write},
        net::TcpStream,
        os::windows::{ffi::OsStrExt, process::CommandExt},
        path::{Path, PathBuf},
        process::{Child, ChildStdout, Command, Stdio},
        thread,
        time::{Duration, SystemTime, UNIX_EPOCH},
    };
    use windows_sys::Win32::Storage::FileSystem::MoveFileW;

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
    fn select_snapshot(
        runtime: &Path,
        node: &Path,
        parent: &Path,
    ) -> io::Result<Option<Option<PathBuf>>> {
        match MessageDialog::new().set_title(TITLE).set_level(MessageLevel::Info).set_buttons(MessageButtons::YesNoCancel)
            .set_description("Pretende importar dados existentes?\n\nSim: escolher os dados antigos.\nNão: criar uma base de dados vazia.\nCancelar: sair.").show() {
            MessageDialogResult::No => return Ok(Some(None)),
            MessageDialogResult::Yes => {},
            _ => return Ok(None),
        }
        match MessageDialog::new().set_title(TITLE).set_level(MessageLevel::Info).set_buttons(MessageButtons::YesNoCancel)
            .set_description("Os dados estão no formato antigo WINDEV/HFSQL?\n\nSim: criar e importar uma cópia verificada.\nNão: selecionar uma exportação SQLite já preparada.\nCancelar: sair.").show() {
            MessageDialogResult::No => return Ok(FileDialog::new().set_title("Selecionar exportação verificada").add_filter("Exportação SQLite", &["sqlite"]).pick_file().map(Some)),
            MessageDialogResult::Yes => {},
            _ => return Ok(None),
        }
        message(
            "Feche o programa antigo antes de continuar. Selecione a pasta que contém os ficheiros .FIC e depois o ficheiro de análise .WDD correspondente. É necessário o driver ODBC HFSQL 28 de 32 bits.",
            MessageLevel::Info,
        );
        let Some(data) = FileDialog::new()
            .set_title("Selecionar pasta dos dados antigos")
            .pick_folder()
        else {
            return Ok(None);
        };
        let Some(analysis) = FileDialog::new()
            .set_title("Selecionar análise antiga")
            .add_filter("Análise WINDEV", &["wdd"])
            .pick_file()
        else {
            return Ok(None);
        };
        message(
            "Será criada uma cópia privada e verificada dos dados. Aguarde; esta operação pode demorar vários minutos.",
            MessageLevel::Info,
        );
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
        Ok(Some(Some(output.join("data.sqlite"))))
    }
    fn setup(
        runtime: &Path,
        node: &Path,
        browser: &Path,
        parent: &Path,
        profile: &Path,
    ) -> io::Result<bool> {
        let snapshot = match select_snapshot(runtime, node, parent)? {
            Some(value) => value,
            None => return Ok(false),
        };
        message(
            "A base de dados será preparada agora. Aguarde; a importação pode demorar vários minutos.",
            MessageLevel::Info,
        );
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
        Ok(true)
    }
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
        if !profile.exists() && !setup(&runtime, &node, &browser, &parent, &profile)? {
            return Ok(());
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
        let token = profile.join("operator-token");
        if token.is_file() && enrollment_available(3210)? {
            message(
                "Para definir o primeiro acesso, copie o código que vai abrir no Bloco de Notas e escolha uma nova palavra-passe na aplicação.",
                MessageLevel::Info,
            );
            let system = PathBuf::from(std::env::var_os("SystemRoot").ok_or_else(failed)?)
                .join("System32/notepad.exe");
            let _ = Command::new(system).arg(token).spawn();
        }
        if host.child.try_wait()?.is_some() {
            return Err(failed());
        }
        let client_result = match Command::new(app).current_dir(folder).spawn() {
            Ok(mut client) => loop {
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
            },
            Err(error) => Err(error),
        };
        drop(host.child.stdin.take());
        let status = host.child.wait();
        client_result?;
        if !status?.success() {
            return Err(failed());
        }
        Ok(())
    }
    pub fn main() {
        if run().is_err() {
            message(
                "Não foi possível iniciar a aplicação ou preparar a base de dados. Verifique se o programa antigo está fechado e se o driver ODBC HFSQL 28 de 32 bits e a análise .WDD estão disponíveis. Os dados existentes foram preservados. Contacte o responsável pela instalação.",
                MessageLevel::Error,
            );
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use std::{fs, net::TcpListener};

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
