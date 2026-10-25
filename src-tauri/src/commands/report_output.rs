use crate::contracts::{ReportOutputResult, ReportPdfRequest};
use base64::{Engine, engine::general_purpose::STANDARD};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};

#[cfg(any(target_os = "windows", test))]
mod cache;

pub const SAVE_REPORT_PDF_COMMAND: &str = "save_report_pdf";
pub const PRINT_REPORT_PDF_COMMAND: &str = "print_report_pdf";
const MAX_PDF_BYTES: usize = 32 * 1024 * 1024;
const MAX_BASE64_BYTES: usize = MAX_PDF_BYTES.div_ceil(3) * 4;
const REPORT_IDS: [&str; 28] = [
    "RPT_Ordens_Reparacao",
    "RPT_Extrato_artigos",
    "RPT_List_Clientes",
    "RPT_List_Viaturas",
    "RPT_List_artigos",
    "RPT_List_documentos",
    "RPT_List_estados_descritivos",
    "RPT_List_estados_reparacao",
    "RPT_List_mecanicos",
    "RPT_List_unidades",
    "RPT_List_utilizadores",
    "RPT_inventario",
    "RPT_Consumo_Material_Descriminado_Ordens",
    "RPT_Consumo_Material_Descriminado_Saidas",
    "RPT_Consumo_Material_Descriminado_ordens_saidas",
    "RPT_Consumo_Material_Resumo_Saidas",
    "RPT_Consumo_Material_Resumo_ordem_saidas",
    "RPT_Consumo_Material_Resumo_ordens",
    "RPT_Consumo_Material_Viatura_Descriminado",
    "RPT_Consumo_Material_Viatura_Resumo",
    "RPT_Ordens_Reparacao_DataEntrega",
    "RPT_Ordens_Reparacao_DataPag",
    "RPT_Tempos_Ordem_Reparacao",
    "RPT_Tempos_Ordem_Reparacao_Mecanico",
    "RPT_Tempos_Ordem_Reparacao_Mecanico_Resumo",
    "RPT_Tempos_Ordem_Reparacao_viatura",
    "RPT_Materiais",
    "RPT_Servico_Avaria",
];
static OUTPUT_ACTIVE: AtomicBool = AtomicBool::new(false);
static FILE_SEQUENCE: AtomicU64 = AtomicU64::new(0);

struct OutputGuard;
impl OutputGuard {
    fn acquire() -> Result<Self, String> {
        OUTPUT_ACTIVE
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map(|_| Self)
            .map_err(|_| "report_output_busy".into())
    }
}
impl Drop for OutputGuard {
    fn drop(&mut self) {
        OUTPUT_ACTIVE.store(false, Ordering::Release);
    }
}

fn validate(request: &ReportPdfRequest) -> Result<Vec<u8>, String> {
    if !REPORT_IDS.contains(&request.report_id.as_str())
        || request.pdf_base64.len() > MAX_BASE64_BYTES
    {
        return Err("invalid_report_pdf".into());
    }
    let bytes = STANDARD
        .decode(&request.pdf_base64)
        .map_err(|_| "invalid_report_pdf")?;
    // Canonical padding/alphabet only: never tolerate whitespace, URL-safe input or trailing bits.
    if bytes.len() > MAX_PDF_BYTES
        || STANDARD.encode(&bytes) != request.pdf_base64
        || !(bytes.get(..7) == Some(b"%PDF-1.")
            && bytes
                .get(7)
                .is_some_and(|version| (b'0'..=b'7').contains(version))
            || bytes.starts_with(b"%PDF-2.0"))
        || !bytes.get(8).is_some_and(u8::is_ascii_whitespace)
        || !bytes.trim_ascii_end().ends_with(b"%%EOF")
    {
        return Err("invalid_report_pdf".into());
    }
    Ok(bytes)
}

fn unique_name(prefix: &str, suffix: &str) -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let sequence = FILE_SEQUENCE.fetch_add(1, Ordering::Relaxed);
    format!("{prefix}{now:032x}-{sequence:016x}{suffix}")
}

struct OwnerLifetime<R: tauri::Runtime> {
    window: tauri::WebviewWindow<R>,
    alive: std::sync::Arc<AtomicBool>,
    listener: tauri::EventId,
}
impl<R: tauri::Runtime> OwnerLifetime<R> {
    fn new(window: tauri::WebviewWindow<R>) -> Self {
        use tauri::Listener;
        let alive = std::sync::Arc::new(AtomicBool::new(true));
        let flag = alive.clone();
        let listener = window.listen("tauri://destroyed", move |_| {
            flag.store(false, Ordering::Release);
        });
        Self {
            window,
            alive,
            listener,
        }
    }
    fn check(&self) -> Result<(), String> {
        if self.alive.load(Ordering::Acquire) {
            Ok(())
        } else {
            Err("report_owner_closed".into())
        }
    }
}
impl<R: tauri::Runtime> Drop for OwnerLifetime<R> {
    fn drop(&mut self) {
        use tauri::Listener;
        self.window.unlisten(self.listener);
    }
}

fn atomic_save(path: &std::path::Path, bytes: &[u8], alive: &AtomicBool) -> Result<(), String> {
    use std::{fs::OpenOptions, io::Write};
    if !alive.load(Ordering::Acquire) {
        return Err("report_owner_closed".into());
    }
    let parent = path.parent().ok_or("report_save_failed")?;
    let temporary = parent.join(unique_name(".gestao-report-", ".tmp"));
    let mut options = OpenOptions::new();
    options.create_new(true).write(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(&temporary).map_err(|_| "report_save_failed")?;
    let result = (|| {
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|_| "report_save_failed")?;
        drop(file);
        if !alive.load(Ordering::Acquire) {
            return Err("report_owner_closed");
        }
        std::fs::rename(&temporary, path).map_err(|_| "report_save_failed")
    })();
    if result.is_err() {
        let _ = std::fs::remove_file(&temporary);
    }
    result.map_err(str::to_owned)
}

/// No caller filename/path, arbitrary command or regenerated document crosses this boundary.
#[tauri::command]
pub async fn save_report_pdf<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    request: ReportPdfRequest,
) -> Result<ReportOutputResult, String> {
    let guard = OutputGuard::acquire()?;
    // Serialize the bounded decode too, not only the eventual OS panel.
    let bytes = validate(&request)?;
    let owner = OwnerLifetime::new(window);
    // A detached IPC await cannot release the singleton while its actual OS operation is active.
    tauri::async_runtime::spawn(async move {
        let _guard = guard;
        owner.check()?;
        owner
            .window
            .set_focus()
            .map_err(|_| "report_owner_closed")?;
        #[cfg(any(target_os = "windows", target_os = "macos"))]
        {
            let selected = rfd::AsyncFileDialog::new()
                .set_parent(&owner.window)
                .set_title("PDF")
                .add_filter("PDF", &["pdf"])
                .set_file_name(format!("{}.pdf", request.report_id))
                .save_file()
                .await;
            owner.check()?;
            let Some(file) = selected else {
                return Ok(ReportOutputResult::Cancelled);
            };
            let path = file.path().to_owned();
            tauri::async_runtime::spawn_blocking(move || {
                atomic_save(&path, &bytes, &owner.alive)?;
                owner.check()?;
                Ok(ReportOutputResult::Saved)
            })
            .await
            .map_err(|_| "report_save_failed".to_owned())?
        }
        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            let _ = (bytes, request, owner);
            Err("unsupported_platform".into())
        }
    })
    .await
    .map_err(|_| "report_save_failed".to_owned())?
}

#[tauri::command]
pub async fn print_report_pdf<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    request: ReportPdfRequest,
) -> Result<ReportOutputResult, String> {
    let guard = OutputGuard::acquire()?;
    let bytes = validate(&request)?;
    let owner = OwnerLifetime::new(window);
    tauri::async_runtime::spawn(async move { platform_print(owner, bytes, guard).await })
        .await
        .map_err(|_| "report_print_failed".to_owned())?
}

#[cfg(target_os = "macos")]
async fn platform_print<R: tauri::Runtime>(
    owner: OwnerLifetime<R>,
    bytes: Vec<u8>,
    guard: OutputGuard,
) -> Result<ReportOutputResult, String> {
    unsafe extern "C" {
        fn gestao_print_report_pdf(
            bytes: *const u8,
            length: usize,
            window: *mut std::ffi::c_void,
        ) -> std::ffi::c_int;
    }
    let window = owner.window.clone();
    let (sender, mut receiver) = tauri::async_runtime::channel(1);
    window
        .run_on_main_thread(move || {
            let _guard = guard;
            let print = || {
                owner.check()?;
                let handle = owner
                    .window
                    .ns_window()
                    .map_err(|_| "report_owner_closed")?;
                // The UI thread owns the NSWindow and Vec allocation until the synchronous panel returns.
                let result =
                    unsafe { gestao_print_report_pdf(bytes.as_ptr(), bytes.len(), handle) };
                owner.check()?;
                match result {
                    1 => Ok(ReportOutputResult::Requested),
                    0 => Ok(ReportOutputResult::NotRequested),
                    _ => Err("report_print_failed".into()),
                }
            };
            let _ = sender.try_send(print());
        })
        .map_err(|_| "report_print_failed")?;
    receiver
        .recv()
        .await
        .ok_or_else(|| "report_print_failed".to_owned())?
}

#[cfg(target_os = "windows")]
async fn platform_print<R: tauri::Runtime>(
    owner: OwnerLifetime<R>,
    bytes: Vec<u8>,
    guard: OutputGuard,
) -> Result<ReportOutputResult, String> {
    use std::os::windows::ffi::OsStrExt;
    use tauri::Manager;
    use windows_sys::Win32::{
        System::Com::{
            COINIT_APARTMENTTHREADED, COINIT_DISABLE_OLE1DDE, CoInitializeEx, CoUninitialize,
        },
        UI::{
            Shell::{SE_ERR_ASSOCINCOMPLETE, SE_ERR_NOASSOC, ShellExecuteW},
            WindowsAndMessaging::SW_SHOWNORMAL,
        },
    };
    static STARTED: AtomicBool = AtomicBool::new(false);
    owner.check()?;
    let cache = owner
        .window
        .app_handle()
        .path()
        .app_cache_dir()
        .map_err(|_| "report_cache_failed")?
        .join("report-output-v1");
    let alive = owner.alive.clone();
    let path = tauri::async_runtime::spawn_blocking(move || {
        cache::create(
            &cache,
            &bytes,
            &alive,
            !STARTED.swap(true, Ordering::AcqRel),
        )
    })
    .await
    .map_err(|_| "report_cache_failed")??;
    let window = owner.window.clone();
    let (sender, mut receiver) = tauri::async_runtime::channel(1);
    let abandoned = path.clone();
    if window
        .run_on_main_thread(move || {
            let _guard = guard;
            let print = || {
                owner.check()?;
                let handle = owner.window.hwnd().map_err(|_| "report_owner_closed")?;
                let verb = "print\0".encode_utf16().collect::<Vec<_>>();
                let filename = path
                    .as_os_str()
                    .encode_wide()
                    .chain(Some(0))
                    .collect::<Vec<_>>();
                // UI thread COM is normally initialized by the runtime. Balance only our successful call.
                let initialized = unsafe {
                    CoInitializeEx(
                        std::ptr::null(),
                        (COINIT_APARTMENTTHREADED | COINIT_DISABLE_OLE1DDE) as u32,
                    )
                };
                let result = unsafe {
                    ShellExecuteW(
                        handle.0,
                        verb.as_ptr(),
                        filename.as_ptr(),
                        std::ptr::null(),
                        std::ptr::null(),
                        SW_SHOWNORMAL,
                    )
                } as isize;
                if initialized >= 0 {
                    unsafe {
                        CoUninitialize();
                    }
                }
                if result <= 32 {
                    return Err(
                        if result == SE_ERR_NOASSOC as isize
                            || result == SE_ERR_ASSOCINCOMPLETE as isize
                        {
                            "report_print_handler_missing".into()
                        } else {
                            "report_print_failed".into()
                        },
                    );
                }
                // Once handed off, retain the cache even if the owner closes; an external job may still use it.
                Ok(ReportOutputResult::Requested)
            };
            let result = print();
            if result.is_err() {
                let _ = std::fs::remove_file(&path);
            }
            let _ = sender.try_send(result);
        })
        .is_err()
    {
        let _ = std::fs::remove_file(abandoned);
        return Err("report_print_failed".into());
    }
    receiver
        .recv()
        .await
        .ok_or_else(|| "report_print_failed".to_owned())?
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
async fn platform_print<R: tauri::Runtime>(
    owner: OwnerLifetime<R>,
    bytes: Vec<u8>,
    guard: OutputGuard,
) -> Result<ReportOutputResult, String> {
    let _ = (owner, bytes, guard);
    Err("unsupported_platform".into())
}

#[cfg(test)]
mod tests {
    use super::*;
    fn request(bytes: &[u8]) -> ReportPdfRequest {
        ReportPdfRequest {
            report_id: "RPT_inventario".into(),
            pdf_base64: STANDARD.encode(bytes),
        }
    }
    #[test]
    fn strict_request_and_canonical_pdf_limits_precede_native_actions() {
        let pdf = b"%PDF-1.7\nsynthetic payload\n%%EOF\n";
        assert_eq!(validate(&request(pdf)).unwrap(), pdf);
        for bytes in [
            b"not pdf".as_slice(),
            b"%PDF-1.7\nno trailer",
            b"prefix%PDF-1.7\n%%EOF",
            b"%PDF-1.x\n%%EOF",
            b"%PDF-1.7wrong\n%%EOF",
        ] {
            assert!(validate(&request(bytes)).is_err());
        }
        for value in ["../outside", "C:\\unsafe.pdf", "RPT_unknown", ""] {
            let mut r = request(pdf);
            r.report_id = value.into();
            assert!(validate(&r).is_err());
        }
        for value in ["AAAA=", "AB==", "JVBERi0xLjcKJSVFT0Y=\n", "", "__--"] {
            let mut r = request(pdf);
            r.pdf_base64 = value.into();
            assert!(validate(&r).is_err());
        }
        let mut huge = request(pdf);
        huge.pdf_base64 = "A".repeat(MAX_BASE64_BYTES + 1);
        assert!(validate(&huge).is_err());
        assert!(
            serde_json::from_value::<ReportPdfRequest>(
                serde_json::json!({"reportId":"RPT_inventario","pdfBase64":"x","path":"unsafe"})
            )
            .is_err()
        );
        assert!(
            serde_json::from_value::<ReportPdfRequest>(
                serde_json::json!({"reportId":"RPT_inventario"})
            )
            .is_err()
        );
        assert_eq!(
            REPORT_IDS.len(),
            REPORT_IDS
                .into_iter()
                .collect::<std::collections::HashSet<_>>()
                .len()
        );
    }
    #[test]
    fn singleton_survives_until_actual_guard_drop_and_result_never_claims_printed() {
        let guard = OutputGuard::acquire().unwrap();
        assert!(OutputGuard::acquire().is_err());
        drop(guard);
        assert!(OutputGuard::acquire().is_ok());
        assert_eq!(
            serde_json::to_value(ReportOutputResult::Requested).unwrap(),
            serde_json::json!({"kind":"requested"})
        );
        assert_eq!(
            serde_json::to_value(ReportOutputResult::NotRequested).unwrap(),
            serde_json::json!({"kind":"not_requested"})
        );
    }
    #[test]
    fn decoded_limit_rejects_extra_byte_even_inside_the_valid_encoded_length() {
        let mut bytes = vec![b' '; MAX_PDF_BYTES + 1];
        bytes[..9].copy_from_slice(b"%PDF-1.7\n");
        let end = bytes.len();
        bytes[end - 7..].copy_from_slice(b"\n%%EOF\n");
        let oversized = request(&bytes);
        assert_eq!(oversized.pdf_base64.len(), MAX_BASE64_BYTES);
        assert!(validate(&oversized).is_err());
        drop(oversized);
        bytes.pop();
        assert_eq!(validate(&request(&bytes)).unwrap().len(), MAX_PDF_BYTES);
    }
    #[test]
    fn save_preserves_exact_bytes_and_closed_owner_keeps_existing_file() {
        let root = std::env::temp_dir().join(unique_name("gestao-report-save-", ""));
        std::fs::create_dir(&root).unwrap();
        let path = root.join("selected.pdf");
        std::fs::write(&path, b"original").unwrap();
        assert_eq!(
            atomic_save(
                &root.join("absent").join("file.pdf"),
                b"closed",
                &AtomicBool::new(false)
            ),
            Err("report_owner_closed".into())
        );
        assert_eq!(
            atomic_save(&path, b"new exact bytes", &AtomicBool::new(false)),
            Err("report_owner_closed".into())
        );
        assert_eq!(std::fs::read(&path).unwrap(), b"original");
        atomic_save(
            &path,
            b"%PDF-1.7\nexact bytes\n%%EOF\n",
            &AtomicBool::new(true),
        )
        .unwrap();
        assert_eq!(
            std::fs::read(&path).unwrap(),
            b"%PDF-1.7\nexact bytes\n%%EOF\n"
        );
        assert_eq!(std::fs::read_dir(&root).unwrap().count(), 1);
        std::fs::remove_dir_all(root).unwrap();
    }
}
