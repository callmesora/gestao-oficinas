#[test]
fn foundation_dispatches_catalog_command_through_real_handler_on_mock_runtime() {
    let app = gestao_oficinas_lib::configure(tauri::test::mock_builder())
        .build(tauri::test::mock_context(tauri::test::noop_assets()))
        .unwrap();
    let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
        .build()
        .unwrap();
    let response = tauri::test::get_ipc_response(
        &webview,
        tauri::webview::InvokeRequest {
            cmd: gestao_oficinas_lib::commands::NATIVE_INFO_COMMAND.into(),
            callback: tauri::ipc::CallbackFn(0),
            error: tauri::ipc::CallbackFn(1),
            url: webview.url().unwrap(),
            body: tauri::ipc::InvokeBody::default(),
            headers: Default::default(),
            invoke_key: tauri::test::INVOKE_KEY.to_owned(),
        },
    )
    .unwrap()
    .deserialize::<serde_json::Value>()
    .unwrap();
    assert_eq!(response["appVersion"], env!("CARGO_PKG_VERSION"));
    assert_eq!(response["platform"], std::env::consts::OS);
}

#[test]
fn startup_arguments_dispatches_registered_handler_without_exposing_unrelated_argv() {
    let app = gestao_oficinas_lib::configure(tauri::test::mock_builder())
        .build(tauri::test::mock_context(tauri::test::noop_assets()))
        .unwrap();
    let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
        .build()
        .unwrap();
    let response = tauri::test::get_ipc_response(
        &webview,
        tauri::webview::InvokeRequest {
            cmd: gestao_oficinas_lib::commands::READ_STARTUP_ARGUMENTS_COMMAND.into(),
            callback: tauri::ipc::CallbackFn(0),
            error: tauri::ipc::CallbackFn(1),
            url: webview.url().unwrap(),
            body: tauri::ipc::InvokeBody::default(),
            headers: Default::default(),
            invoke_key: tauri::test::INVOKE_KEY.to_owned(),
        },
    )
    .unwrap()
    .deserialize::<serde_json::Value>()
    .unwrap();
    assert_eq!(response, serde_json::json!({"modulo":null,"artigos":null}));
}
