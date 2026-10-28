mod wizard {
    use super::*;
    use std::sync::{Arc, Mutex};
    use tauri::{Emitter, State, WebviewWindow};

    #[derive(Clone)]
    enum Selection {
        Legacy { data: PathBuf, analysis: PathBuf },
        Sqlite(PathBuf),
        Empty,
    }

    #[derive(serde::Serialize)]
    struct Summary {
        kind: &'static str,
        name: String,
        path: String,
        analysis: Option<String>,
    }

    struct Model {
        selection: Option<Selection>,
        stage: &'static str,
        busy: bool,
        completed: bool,
        proceed: bool,
    }

    struct WizardState {
        model: Arc<Mutex<Model>>,
        runtime: PathBuf,
        node: PathBuf,
        browser: PathBuf,
        parent: PathBuf,
        profile: PathBuf,
    }

    fn main_window(window: &WebviewWindow) -> Result<(), String> {
        if window.label() == "main" {
            Ok(())
        } else {
            Err("invalid_window".into())
        }
    }

    fn display_name(path: &Path) -> String {
        path.file_name()
            .unwrap_or(path.as_os_str())
            .to_string_lossy()
            .into_owned()
    }

    fn summarize(selection: &Selection) -> Summary {
        match selection {
            Selection::Legacy { data, analysis } => Summary {
                kind: "legacy",
                name: analysis
                    .file_stem()
                    .unwrap_or(analysis.as_os_str())
                    .to_string_lossy()
                    .into_owned(),
                path: data.to_string_lossy().into_owned(),
                analysis: Some(display_name(analysis)),
            },
            Selection::Sqlite(file) => Summary {
                kind: "sqlite",
                name: display_name(file),
                path: file.to_string_lossy().into_owned(),
                analysis: None,
            },
            Selection::Empty => Summary {
                kind: "empty",
                name: "Base de dados vazia".into(),
                path: String::new(),
                analysis: None,
            },
        }
    }

    #[derive(serde::Serialize)]
    struct Status {
        stage: &'static str,
        selection: Option<Summary>,
    }

    #[tauri::command]
    fn wizard_status(
        window: WebviewWindow,
        state: State<'_, WizardState>,
    ) -> Result<Status, String> {
        main_window(&window)?;
        let model = state.model.lock().map_err(|_| "state_unavailable")?;
        Ok(Status {
            stage: model.stage,
            selection: model.selection.as_ref().map(summarize),
        })
    }

    #[tauri::command]
    fn wizard_select(
        window: WebviewWindow,
        state: State<'_, WizardState>,
        kind: &str,
    ) -> Result<Option<Summary>, String> {
        main_window(&window)?;
        {
            let model = state.model.lock().map_err(|_| "state_unavailable")?;
            if model.busy || model.completed {
                return Err("preparation_active".into());
            }
        }
        let selection = match kind {
            "legacy" => {
                let Some(selected) = FileDialog::new()
                    .set_title("Selecionar pasta do programa antigo ou dos dados")
                    .pick_folder()
                else {
                    return Ok(None);
                };
                let data = if let Some(data) = data_folder(&selected) {
                    data
                } else {
                    message(
                        "Não foi possível identificar uma única pasta de dados. Selecione a pasta que contém os ficheiros Clientes.fic e Viaturas.fic.",
                        MessageLevel::Info,
                    );
                    let Some(data) = FileDialog::new()
                        .set_directory(&selected)
                        .set_title("Selecionar pasta dos ficheiros .FIC")
                        .pick_folder()
                    else {
                        return Ok(None);
                    };
                    data
                };
                let analysis = if let Some(analysis) = analysis_file(&data) {
                    analysis
                } else {
                    message(
                        "Não foi possível identificar uma única análise WINDEV. Selecione o ficheiro .WDD correspondente aos dados.",
                        MessageLevel::Info,
                    );
                    let Some(analysis) = FileDialog::new()
                        .set_directory(data.parent().unwrap_or(&data))
                        .set_title("Selecionar análise antiga")
                        .add_filter("Análise WINDEV", &["wdd"])
                        .pick_file()
                    else {
                        return Ok(None);
                    };
                    analysis
                };
                Selection::Legacy { data, analysis }
            }
            "sqlite" => {
                let Some(file) = FileDialog::new()
                    .set_title("Selecionar exportação verificada")
                    .add_filter("Exportação SQLite", &["sqlite"])
                    .pick_file()
                else {
                    return Ok(None);
                };
                Selection::Sqlite(file)
            }
            "empty" => Selection::Empty,
            _ => return Err("invalid_choice".into()),
        };
        let summary = summarize(&selection);
        let mut model = state.model.lock().map_err(|_| "state_unavailable")?;
        if model.busy || model.completed {
            return Err("preparation_active".into());
        }
        model.selection = Some(selection);
        model.stage = "choose";
        Ok(Some(summary))
    }

    #[tauri::command]
    fn wizard_start(
        window: WebviewWindow,
        app: tauri::AppHandle,
        state: State<'_, WizardState>,
    ) -> Result<(), String> {
        main_window(&window)?;
        let selection = {
            let mut model = state.model.lock().map_err(|_| "state_unavailable")?;
            if model.busy || model.completed || state.profile.exists() {
                return Err("preparation_unavailable".into());
            }
            let selection = model.selection.clone().ok_or("selection_required")?;
            model.busy = true;
            model.stage = if matches!(selection, Selection::Legacy { .. }) {
                "copy"
            } else {
                "database"
            };
            selection
        };
        let (runtime, node, browser, parent, profile) = (
            state.runtime.clone(),
            state.node.clone(),
            state.browser.clone(),
            state.parent.clone(),
            state.profile.clone(),
        );
        let model = state.model.clone();
        std::thread::spawn(move || {
            let notify = |stage: &'static str| {
                if let Ok(mut state) = model.lock() {
                    state.stage = stage;
                }
                let _ = app.emit("migration-progress", stage);
            };
            let outcome =
                std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| -> io::Result<()> {
                    let snapshot = match selection {
                        Selection::Legacy { data, analysis } => {
                            notify("copy");
                            Some(export_snapshot(
                                &runtime, &node, &parent, &data, &analysis, &notify,
                            )?)
                        }
                        Selection::Sqlite(file) => Some(file),
                        Selection::Empty => None,
                    };
                    notify("database");
                    setup_snapshot(&runtime, &node, &browser, &parent, &profile, snapshot)
                }));
            let success = outcome.is_ok_and(|result| result.is_ok());
            if let Ok(mut state) = model.lock() {
                state.busy = false;
                state.completed = success;
                state.stage = if success { "done" } else { "error" };
            }
            notify(if success { "done" } else { "error" });
        });
        Ok(())
    }

    #[tauri::command]
    fn wizard_continue(
        window: WebviewWindow,
        app: tauri::AppHandle,
        state: State<'_, WizardState>,
    ) -> Result<(), String> {
        main_window(&window)?;
        let mut model = state.model.lock().map_err(|_| "state_unavailable")?;
        if !model.completed || model.busy {
            return Err("preparation_incomplete".into());
        }
        model.proceed = true;
        drop(model);
        app.exit(0);
        Ok(())
    }

    #[tauri::command]
    fn wizard_cancel(
        window: WebviewWindow,
        app: tauri::AppHandle,
        state: State<'_, WizardState>,
    ) -> Result<(), String> {
        main_window(&window)?;
        if state.model.lock().map_err(|_| "state_unavailable")?.busy {
            return Err("preparation_active".into());
        }
        app.exit(0);
        Ok(())
    }

    pub(super) fn run(
        runtime: &Path,
        node: &Path,
        browser: &Path,
        parent: &Path,
        profile: &Path,
    ) -> io::Result<bool> {
        let model = Arc::new(Mutex::new(Model {
            selection: None,
            stage: "choose",
            busy: false,
            completed: false,
            proceed: false,
        }));
        let state = WizardState {
            model: model.clone(),
            runtime: runtime.into(),
            node: node.into(),
            browser: browser.into(),
            parent: parent.into(),
            profile: profile.into(),
        };
        let mut context = gestao_oficinas_lib::app_context();
        let config = context.config_mut();
        let window = config.app.windows.first_mut().ok_or_else(failed)?;
        window.url = tauri::WebviewUrl::App("index.html?migration=1".into());
        window.title = "Preparar Gestão de Oficinas".into();
        window.width = 900.0;
        window.height = 760.0;
        window.min_width = Some(650.0);
        window.min_height = Some(600.0);
        let guard = model.clone();
        let app = tauri::Builder::default()
            .manage(state)
            .invoke_handler(tauri::generate_handler![
                wizard_select,
                wizard_status,
                wizard_start,
                wizard_continue,
                wizard_cancel
            ])
            .on_window_event(move |_window, event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event
                    && guard.lock().map(|state| state.busy).unwrap_or(true)
                {
                    api.prevent_close();
                }
            })
            .build(context)
            .map_err(|_| failed())?;
        let guard = model.clone();
        app.run_return(move |_app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event
                && guard.lock().map(|state| state.busy).unwrap_or(true)
            {
                api.prevent_exit();
            }
        });
        let result = model.lock().map_err(|_| failed())?.proceed;
        Ok(result)
    }
}
