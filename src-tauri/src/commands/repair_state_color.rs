use crate::contracts::{RepairStateColorRequest, RepairStateColorResult};
use std::sync::atomic::{AtomicBool, Ordering};

pub const SELECT_REPAIR_STATE_COLOR_COMMAND: &str = "select_repair_state_color";

static COLOR_DIALOG_ACTIVE: AtomicBool = AtomicBool::new(false);

struct DialogGuard;

impl DialogGuard {
    fn acquire() -> Result<Self, String> {
        COLOR_DIALOG_ACTIVE
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .map(|_| Self)
            .map_err(|_| "color_dialog_busy".into())
    }
}

impl Drop for DialogGuard {
    fn drop(&mut self) {
        COLOR_DIALOG_ACTIVE.store(false, Ordering::Release);
    }
}

// ADR-005: unsupported values use picker black only; cancellation retains the raw value.
fn initial_rgb(color: Option<u32>) -> u32 {
    color.filter(|value| *value <= 0x00ff_ffff).unwrap_or(0)
}

fn cancelled(color: Option<u32>) -> RepairStateColorResult {
    RepairStateColorResult::Cancelled { color }
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
struct OwnerLifetime<R: tauri::Runtime> {
    window: tauri::WebviewWindow<R>,
    alive: std::sync::Arc<AtomicBool>,
    listener: tauri::EventId,
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
impl<R: tauri::Runtime> OwnerLifetime<R> {
    fn new(window: tauri::WebviewWindow<R>) -> Self {
        use tauri::Listener;
        let alive = std::sync::Arc::new(AtomicBool::new(true));
        let event_alive = alive.clone();
        let listener = window.listen("tauri://destroyed", move |_| {
            event_alive.store(false, Ordering::Release);
        });
        Self {
            window,
            alive,
            listener,
        }
    }

    fn is_alive(&self) -> bool {
        self.alive.load(Ordering::Acquire)
    }
}

#[cfg(any(target_os = "windows", target_os = "macos"))]
impl<R: tauri::Runtime> Drop for OwnerLifetime<R> {
    fn drop(&mut self) {
        use tauri::Listener;
        self.window.unlisten(self.listener);
    }
}

// SRC-899177adfa: the caller awaits both outcomes and always assigns color/preview.
// This exposes no caller-controlled script, process, path or business operation.
#[tauri::command]
pub async fn select_repair_state_color<R: tauri::Runtime>(
    window: tauri::WebviewWindow<R>,
    request: RepairStateColorRequest,
) -> Result<RepairStateColorResult, String> {
    let guard = DialogGuard::acquire()?;
    #[cfg(any(target_os = "windows", target_os = "macos"))]
    {
        let owner = OwnerLifetime::new(window);
        platform_choose(owner, request.color, guard).await
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = (window, request, guard);
        Err("unsupported_platform".into())
    }
}

#[cfg(any(target_os = "macos", test))]
fn mac_default_components(color: Option<u32>) -> [u16; 3] {
    let rgb = initial_rgb(color);
    [0, 8, 16].map(|shift| (((rgb >> shift) & 255) * 257) as u16)
}

#[cfg(any(target_os = "macos", test))]
fn parse_mac_output(output: &[u8], raw: Option<u32>) -> Result<RepairStateColorResult, String> {
    if output.len() > 128 {
        return Err("invalid_color_result".into());
    }
    let output = std::str::from_utf8(output)
        .map_err(|_| "invalid_color_result")?
        .trim();
    if output == "cancelled" {
        return Ok(cancelled(raw));
    }
    let components: Vec<_> = output
        .strip_prefix("selected:")
        .ok_or("invalid_color_result")?
        .split(',')
        .collect();
    if components.len() != 3 {
        return Err("invalid_color_result".into());
    }
    let mut rgb = 0u32;
    for (index, component) in components.iter().enumerate() {
        if component.is_empty() || !component.bytes().all(|value| value.is_ascii_digit()) {
            return Err("invalid_color_result".into());
        }
        let value = component
            .parse::<u16>()
            .map_err(|_| "invalid_color_result")?;
        rgb |= ((u32::from(value) + 128) / 257) << (index * 8);
    }
    Ok(RepairStateColorResult::Selected { color: rgb })
}

#[cfg(target_os = "macos")]
const MAC_COLOR_SCRIPT: &str = r#"on run argv
    try
        set initialColor to {(item 1 of argv as integer), (item 2 of argv as integer), (item 3 of argv as integer)}
        activate
        set chosenColor to choose color default color initialColor
        return "selected:" & (item 1 of chosenColor as integer) & "," & (item 2 of chosenColor as integer) & "," & (item 3 of chosenColor as integer)
    on error errorMessage number errorNumber
        if errorNumber is -128 then return "cancelled"
        error number errorNumber
    end try
end run"#;

#[cfg(target_os = "macos")]
async fn platform_choose<R: tauri::Runtime>(
    owner: OwnerLifetime<R>,
    raw: Option<u32>,
    guard: DialogGuard,
) -> Result<RepairStateColorResult, String> {
    tauri::async_runtime::spawn_blocking(move || {
        use std::io::Read;
        use std::process::{Command, Stdio};
        use std::time::Duration;

        // Retain the singleton even if the awaiting IPC future is detached.
        let _guard = guard;
        if !owner.is_alive() {
            return Err("color_owner_closed".into());
        }
        owner.window.set_focus().map_err(|_| "color_owner_closed")?;
        struct OwnedChild(std::process::Child);
        impl Drop for OwnedChild {
            fn drop(&mut self) {
                let _ = self.0.kill();
                let _ = self.0.wait();
            }
        }
        let components = mac_default_components(raw).map(|value| value.to_string());
        let mut child = OwnedChild(
            Command::new("/usr/bin/osascript")
                .args(["-e", MAC_COLOR_SCRIPT, "--"])
                .args(components)
                .stdin(Stdio::null())
                .stdout(Stdio::piped())
                .stderr(Stdio::null())
                .spawn()
                .map_err(|_| "color_dialog_failed")?,
        );
        loop {
            if !owner.is_alive() {
                // Drop kills/reaps our child; a closed owner receives no color result.
                return Err("color_owner_closed".into());
            }
            if let Some(status) = child.0.try_wait().map_err(|_| "color_dialog_failed")? {
                if !status.success() {
                    return Err("color_dialog_failed".into());
                }
                let mut output = Vec::new();
                child
                    .0
                    .stdout
                    .take()
                    .ok_or("invalid_color_result")?
                    .take(129)
                    .read_to_end(&mut output)
                    .map_err(|_| "invalid_color_result")?;
                if !owner.is_alive() {
                    return Err("color_owner_closed".into());
                }
                return parse_mac_output(&output, raw);
            }
            std::thread::sleep(Duration::from_millis(25));
        }
    })
    .await
    .map_err(|_| "color_dialog_failed".to_owned())?
}

#[cfg(target_os = "windows")]
async fn platform_choose<R: tauri::Runtime>(
    owner: OwnerLifetime<R>,
    raw: Option<u32>,
    guard: DialogGuard,
) -> Result<RepairStateColorResult, String> {
    use windows_sys::Win32::UI::Controls::Dialogs::{
        CC_ANYCOLOR, CC_RGBINIT, CHOOSECOLORW, ChooseColorW, CommDlgExtendedError,
    };
    let window = owner.window.clone();
    let (sender, mut receiver) = tauri::async_runtime::channel(1);
    window
        .run_on_main_thread(move || {
            let _guard = guard;
            let choose = || {
                if !owner.is_alive() {
                    return Err("color_owner_closed".into());
                }
                let handle = owner.window.hwnd().map_err(|_| "color_owner_closed")?;
                let mut custom_colors = [0u32; 16];
                let mut request = CHOOSECOLORW {
                    lStructSize: std::mem::size_of::<CHOOSECOLORW>() as u32,
                    hwndOwner: handle.0,
                    rgbResult: initial_rgb(raw),
                    lpCustColors: custom_colors.as_mut_ptr(),
                    Flags: CC_RGBINIT | CC_ANYCOLOR,
                    ..Default::default()
                };
                // The UI thread owns the valid HWND and both live stack allocations
                // until this synchronous API returns. No hook/template pointer is set.
                let selected = unsafe { ChooseColorW(&mut request) };
                if !owner.is_alive() {
                    return Err("color_owner_closed".into());
                }
                if selected != 0 {
                    if request.rgbResult > 0x00ff_ffff {
                        return Err("invalid_color_result".into());
                    }
                    Ok(RepairStateColorResult::Selected {
                        color: request.rgbResult,
                    })
                } else if unsafe { CommDlgExtendedError() } == 0 {
                    Ok(cancelled(raw))
                } else {
                    Err("color_dialog_failed".into())
                }
            };
            let _ = sender.try_send(choose());
        })
        .map_err(|_| "color_dialog_failed")?;
    receiver
        .recv()
        .await
        .ok_or_else(|| "color_dialog_failed".to_owned())?
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn color_request_is_strict_nullable_unsigned32() {
        for value in [serde_json::json!(null), serde_json::json!(4294967295u32)] {
            assert!(
                serde_json::from_value::<RepairStateColorRequest>(
                    serde_json::json!({"color":value})
                )
                .is_ok()
            );
        }
        for value in [
            serde_json::json!({}),
            serde_json::json!({"color":-1}),
            serde_json::json!({"color":4294967296u64}),
            serde_json::json!({"color":1.5}),
            serde_json::json!({"color":"1"}),
            serde_json::json!({"color":0,"script":"anything"}),
        ] {
            assert!(serde_json::from_value::<RepairStateColorRequest>(value).is_err());
        }
    }

    #[test]
    fn registered_color_command_rejects_invalid_ipc_before_opening_a_dialog() {
        let app = crate::configure(tauri::test::mock_builder())
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .unwrap();
        let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
            .build()
            .unwrap();
        let result = tauri::test::get_ipc_response(
            &webview,
            tauri::webview::InvokeRequest {
                cmd: SELECT_REPAIR_STATE_COLOR_COMMAND.into(),
                callback: tauri::ipc::CallbackFn(0),
                error: tauri::ipc::CallbackFn(1),
                url: webview.url().unwrap(),
                body: tauri::ipc::InvokeBody::Json(serde_json::json!({"request":{"color":-1}})),
                headers: Default::default(),
                invoke_key: tauri::test::INVOKE_KEY.to_owned(),
            },
        );
        let error = match result {
            Err(error) => error,
            Ok(_) => panic!("invalid color must not reach the native dialog"),
        };
        assert!(error.as_str().unwrap().contains("expected u32"));
    }

    #[test]
    fn picker_initialization_never_coerces_the_cancelled_raw_value() {
        for raw in [None, Some(0), Some(0x0100_0000), Some(u32::MAX)] {
            assert_eq!(initial_rgb(raw), 0);
            assert_eq!(
                parse_mac_output(b"cancelled\n", raw).unwrap(),
                RepairStateColorResult::Cancelled { color: raw }
            );
            assert_eq!(
                serde_json::to_value(cancelled(raw)).unwrap(),
                serde_json::json!({"kind":"cancelled","color":raw})
            );
        }
        assert_eq!(
            mac_default_components(Some(0x0033_2211)),
            [4369, 8738, 13107]
        );
        assert_eq!(mac_default_components(Some(u32::MAX)), [0, 0, 0]);
    }

    #[test]
    fn apple_rgb_conversion_preserves_windev_byte_order_and_rounds_nearest() {
        assert_eq!(
            parse_mac_output(b"selected:65535,0,0\n", None).unwrap(),
            RepairStateColorResult::Selected { color: 255 }
        );
        assert_eq!(
            parse_mac_output(b"selected:128,129,65535", None).unwrap(),
            RepairStateColorResult::Selected { color: 0x00ff_0100 }
        );
        for byte in 0..=255u32 {
            let raw = byte | (byte << 8) | (byte << 16);
            let [r, g, b] = mac_default_components(Some(raw));
            assert_eq!(
                parse_mac_output(format!("selected:{r},{g},{b}").as_bytes(), None).unwrap(),
                RepairStateColorResult::Selected { color: raw }
            );
        }
    }

    #[test]
    fn malformed_or_failed_apple_output_cannot_become_a_selected_color() {
        for output in [
            "",
            "selected:1,2",
            "selected:1,2,3,4",
            "selected:-1,0,0",
            "selected:65536,0,0",
            "selected:1.5,0,0",
            "selected:1, 2,3",
            "error:-1743",
            "cancelled:0",
        ] {
            assert!(
                parse_mac_output(output.as_bytes(), None).is_err(),
                "{output}"
            );
        }
        assert!(parse_mac_output(&[b'0'; 129], None).is_err());
        assert!(parse_mac_output(&[255], None).is_err());
    }

    #[test]
    fn color_dialog_singleton_rejects_overlap_and_releases_on_drop() {
        let guard = DialogGuard::acquire().unwrap();
        assert!(DialogGuard::acquire().is_err());
        drop(guard);
        assert!(DialogGuard::acquire().is_ok());
    }
}
