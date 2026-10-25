use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};
use tauri::{Listener, Manager, webview::PageLoadEvent};

// A separate executable: the distributed application never installs this listener/script.
fn main() {
    let business = std::env::var("GESTAO_NATIVE_PROBE_MODE").as_deref() == Ok("business");
    let scanner = std::env::var("GESTAO_NATIVE_PROBE_MODE").as_deref() == Ok("scanner");
    let token = if business {
        let value = std::env::var("GESTAO_NATIVE_PROBE_SETUP_TOKEN")
            .expect("synthetic probe token required");
        assert!(
            value.len() == 64 && value.bytes().all(|value| value.is_ascii_hexdigit()),
            "invalid synthetic probe token"
        );
        serde_json::to_string(&value).expect("synthetic token encoding failed")
    } else {
        String::new()
    };
    let profile = std::env::var_os("GESTAO_NATIVE_PROBE_DATA_DIRECTORY")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| {
            std::env::temp_dir().join(format!("gestao-native-probe-{}", std::process::id()))
        });
    let mut context = gestao_oficinas_lib::app_context();
    context.config_mut().app.windows.clear();
    let reported = Arc::new(AtomicBool::new(false));
    let completed = reported.clone();
    let business_started = Arc::new(AtomicBool::new(false));
    gestao_oficinas_lib::configure(tauri::Builder::default())
        .setup(move |app| {
            let handle = app.handle().clone();
            app.listen("native-probe-result", move |event| {
                if completed.swap(true, Ordering::SeqCst) { return; }
                let mut expected = serde_json::json!({
                    "info": {"appVersion":env!("CARGO_PKG_VERSION"),"platform":std::env::consts::OS},
                    "arguments":gestao_oficinas_lib::commands::startup::read_startup_arguments()
                });
                if business { expected["business"] = serde_json::json!({"enrolled":true,"customerSaved":true,"loggedOut":true,"loggedInAgain":true}); }
                if scanner { expected["scanner"] = serde_json::json!({"exact":true,"repeatable":true,"unavailable":true,"invalidEncoding":true}); }
                let received = serde_json::from_str::<serde_json::Value>(event.payload());
                if received.as_ref().is_ok_and(|value| value == &expected) {
                    println!("NATIVE_PROBE {}", serde_json::json!({"passed":true,"result":expected}));
                } else {
                    eprintln!("NATIVE_PROBE failed_response"); handle.exit(1);
                }
            });
            let failure = app.handle().clone();
            app.listen("native-probe-stage", move |event| {
                if let Ok(stage) = serde_json::from_str::<String>(event.payload())
                    && ["script", "enrollment", "customer", "customer-list", "customer-form", "customer-saved", "logout", "login", "metadata"].contains(&stage.as_str()) {
                    eprintln!("NATIVE_PROBE stage: {stage}");
                }
            });
            app.listen("native-probe-failure", move |event| {
                let stage = serde_json::from_str::<String>(event.payload()).unwrap_or_else(|_| "unknown".into());
                if ["enrollment", "customer", "customer-list", "customer-form", "customer-saved", "logout", "login", "metadata", "scanner"].contains(&stage.as_str()) { eprintln!("NATIVE_PROBE stage failed: {stage}"); }
                failure.exit(1);
            });
            tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App(if business { "index.html" } else { "index.html?diagnostics=foundation" }.into()))
                .title("Gestao Oficinas native startup probe")
                .visible(false)
                .incognito(true)
                .data_directory(profile)
                .build()?;
            let timeout = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(if business { 90 } else { 20 }));
                eprintln!("NATIVE_PROBE timeout"); timeout.exit(1);
            });
            Ok(())
        })
        .on_page_load(move |window, payload| {
            if payload.event() != PageLoadEvent::Finished || (!business && !payload.url().query_pairs().any(|(key,value)| key == "diagnostics" && value == "foundation")) { return; }
            if business && (payload.url().scheme() == "about" || business_started.swap(true, Ordering::SeqCst)) { return; }
            if business { eprintln!("NATIVE_PROBE page_finished"); }
            let script = r#"(async () => {
                const invoke = window.__TAURI_INTERNALS__.invoke;
                const [info, args] = await Promise.all([invoke('native_info'), invoke('read_startup_arguments')]);
                await invoke('plugin:event|emit', {event:'native-probe-result', payload:{info,arguments:args}});
                await invoke('terminate_application');
            })().catch(() => {});"#;
            let business_script = if business { include_str!("native-business-probe.js").replace("__SETUP_TOKEN_JSON__", &token) } else { String::new() };
            if window.eval(if business { &business_script } else if scanner { include_str!("native-scanner-probe.js") } else { script }).is_err() { window.app_handle().exit(1); }
        })
        .run(context)
        .expect("native probe runtime failed");
}
