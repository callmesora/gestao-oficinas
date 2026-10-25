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
fn report_output_dispatch_rejects_unknown_reports_before_any_os_dialog_or_file() {
    let app = gestao_oficinas_lib::configure(tauri::test::mock_builder())
        .build(tauri::test::mock_context(tauri::test::noop_assets()))
        .unwrap();
    let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
        .build()
        .unwrap();
    for command in [
        gestao_oficinas_lib::commands::SAVE_REPORT_PDF_COMMAND,
        gestao_oficinas_lib::commands::PRINT_REPORT_PDF_COMMAND,
    ] {
        let result = tauri::test::get_ipc_response(
            &webview,
            tauri::webview::InvokeRequest {
                cmd: command.into(),
                callback: tauri::ipc::CallbackFn(0),
                error: tauri::ipc::CallbackFn(1),
                url: webview.url().unwrap(),
                body: tauri::ipc::InvokeBody::Json(
                    serde_json::json!({"request":{"reportId":"../outside","pdfBase64":"JVBERi0xLjcKJSVFT0YK"}}),
                ),
                headers: Default::default(),
                invoke_key: tauri::test::INVOKE_KEY.to_owned(),
            },
        );
        assert_eq!(result.unwrap_err(), serde_json::json!("invalid_report_pdf"));
    }
}

#[test]
fn scanner_dispatch_validates_identity_and_refuses_caller_path_or_grant_fields() {
    let app = gestao_oficinas_lib::configure(tauri::test::mock_builder())
        .build(tauri::test::mock_context(tauri::test::noop_assets()))
        .unwrap();
    let webview = tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
        .build()
        .unwrap();
    for request in [
        serde_json::json!({"terminalCode":"","sourceFolder":"","sourceFilename":"scan.txt"}),
        serde_json::json!({"terminalCode":"T01","sourceFolder":"","sourceFilename":"scan.txt","localFile":"/outside"}),
        serde_json::json!({"terminalCode":"T01","sourceFolder":"","sourceFilename":"scan.txt","encoding":"utf-8"}),
    ] {
        let result = tauri::test::get_ipc_response(
            &webview,
            tauri::webview::InvokeRequest {
                cmd: gestao_oficinas_lib::commands::READ_TERMINAL_SCANNER_FILE_COMMAND.into(),
                callback: tauri::ipc::CallbackFn(0),
                error: tauri::ipc::CallbackFn(1),
                url: webview.url().unwrap(),
                body: tauri::ipc::InvokeBody::Json(serde_json::json!({"request":request})),
                headers: Default::default(),
                invoke_key: tauri::test::INVOKE_KEY.to_owned(),
            },
        );
        assert!(result.is_err());
    }
}
