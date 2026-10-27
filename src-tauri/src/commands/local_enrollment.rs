use std::{
    io::{self, Read, Write},
    sync::Mutex,
};
use tauri::{Runtime, State, WebviewWindow};

pub const LOCAL_SETUP_TOKEN_COMMAND: &str = "local_setup_token";
pub const ACK_LOCAL_SETUP_COMMAND: &str = "ack_local_setup";

// Only the owned launcher supplies stdin, and the token is never an argument or
// environment value. The server still enforces one-use enrollment.
pub struct LocalSetupToken {
    value: Option<String>,
    acknowledged: Mutex<bool>,
}
impl LocalSetupToken {
    pub fn from_parent() -> Self {
        if std::env::var_os("GESTAO_SETUP_PIPE").as_deref() != Some(std::ffi::OsStr::new("1")) {
            return Self {
                value: None,
                acknowledged: Mutex::new(false),
            };
        }
        let mut bytes = Vec::new();
        if io::stdin().take(65).read_to_end(&mut bytes).is_err() {
            return Self {
                value: None,
                acknowledged: Mutex::new(false),
            };
        }
        Self {
            value: valid_token(&bytes),
            acknowledged: Mutex::new(false),
        }
    }
    fn for_window(&self, label: &str) -> Option<String> {
        if label == "main" {
            self.value.clone()
        } else {
            None
        }
    }
}
fn valid_token(bytes: &[u8]) -> Option<String> {
    if bytes.len() != 64
        || !bytes
            .iter()
            .all(|byte| byte.is_ascii_digit() || (b'a'..=b'f').contains(byte))
    {
        return None;
    }
    String::from_utf8(bytes.to_vec()).ok()
}

#[tauri::command]
pub fn local_setup_token<R: Runtime>(
    window: WebviewWindow<R>,
    token: State<'_, LocalSetupToken>,
) -> Option<String> {
    token.for_window(window.label())
}

#[tauri::command]
pub fn ack_local_setup<R: Runtime>(
    window: WebviewWindow<R>,
    token: State<'_, LocalSetupToken>,
) -> bool {
    if token.for_window(window.label()).is_none() {
        return false;
    }
    let Ok(mut acknowledged) = token.acknowledged.lock() else {
        return false;
    };
    if !*acknowledged {
        // A fixed non-secret acknowledgement lets the owner detect an old or
        // incompatible client and offer the manual recovery path.
        let mut stdout = io::stdout().lock();
        if stdout
            .write_all(b"SETUP_IPC_READY\n")
            .and_then(|()| stdout.flush())
            .is_err()
        {
            return false;
        }
        *acknowledged = true;
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn bounded_token_and_main_window_only() {
        let token = "a".repeat(64);
        let state = LocalSetupToken {
            value: valid_token(token.as_bytes()),
            acknowledged: Mutex::new(false),
        };
        assert_eq!(state.for_window("main"), Some(token));
        assert_eq!(state.for_window("other"), None);
        for invalid in [
            "a".repeat(63),
            "a".repeat(65),
            "A".repeat(64),
            "z".repeat(64),
        ] {
            assert_eq!(valid_token(invalid.as_bytes()), None);
        }
    }
    #[test]
    fn ipc_exposes_token_only_to_main_window() {
        let app = tauri::test::mock_builder()
            .manage(LocalSetupToken {
                value: Some("a".repeat(64)),
                acknowledged: Mutex::new(false),
            })
            .invoke_handler(tauri::generate_handler![local_setup_token, ack_local_setup])
            .build(tauri::test::mock_context(tauri::test::noop_assets()))
            .unwrap();
        for (label, expected) in [
            ("main", serde_json::json!("a".repeat(64))),
            ("other", serde_json::Value::Null),
        ] {
            let window = tauri::WebviewWindowBuilder::new(&app, label, Default::default())
                .build()
                .unwrap();
            let response = tauri::test::get_ipc_response(
                &window,
                tauri::webview::InvokeRequest {
                    cmd: LOCAL_SETUP_TOKEN_COMMAND.into(),
                    callback: tauri::ipc::CallbackFn(0),
                    error: tauri::ipc::CallbackFn(1),
                    url: window.url().unwrap(),
                    body: tauri::ipc::InvokeBody::default(),
                    headers: Default::default(),
                    invoke_key: tauri::test::INVOKE_KEY.to_owned(),
                },
            )
            .unwrap()
            .deserialize::<serde_json::Value>()
            .unwrap();
            assert_eq!(response, expected);
            let ack = tauri::test::get_ipc_response(
                &window,
                tauri::webview::InvokeRequest {
                    cmd: ACK_LOCAL_SETUP_COMMAND.into(),
                    callback: tauri::ipc::CallbackFn(0),
                    error: tauri::ipc::CallbackFn(1),
                    url: window.url().unwrap(),
                    body: tauri::ipc::InvokeBody::default(),
                    headers: Default::default(),
                    invoke_key: tauri::test::INVOKE_KEY.to_owned(),
                },
            )
            .unwrap()
            .deserialize::<bool>()
            .unwrap();
            assert_eq!(ack, label == "main");
        }
    }
}
