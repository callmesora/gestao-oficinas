use crate::contracts::StartupArguments;

pub const READ_STARTUP_ARGUMENTS_COMMAND: &str = "read_startup_arguments";
pub const TERMINATE_APPLICATION_COMMAND: &str = "terminate_application";

fn supported_argument(args: &[String], name: &str, accepted: &[&str]) -> Option<String> {
    let mut found = None;
    let mut seen = false;
    for (index, argument) in args.iter().enumerate() {
        let Some(option) = argument
            .strip_prefix('/')
            .or_else(|| argument.strip_prefix('-'))
        else {
            continue;
        };
        let (key, attached) = option
            .split_once('=')
            .map_or((option, None), |(key, value)| {
                (key.trim_end(), Some(value.trim_start()))
            });
        if key != name {
            continue;
        }
        if seen {
            return None;
        }
        seen = true;
        let value = match attached {
            Some("") => args.get(index + 1).map(String::as_str),
            Some(value) => Some(value),
            None => match args.get(index + 1).map(String::as_str) {
                Some("=") => args.get(index + 2).map(String::as_str),
                Some(value) => value.strip_prefix('=').map(str::trim_start),
                None => None,
            },
        };
        found = value
            .filter(|value| accepted.contains(value))
            .map(str::to_owned);
    }
    found
}

fn parse_arguments(args: &[String]) -> StartupArguments {
    StartupArguments {
        modulo: supported_argument(args, "modulo", &["t", "m"]),
        artigos: supported_argument(args, "artigos", &["1"]),
    }
}

#[tauri::command]
pub fn read_startup_arguments() -> StartupArguments {
    let arguments: Vec<String> = std::env::args_os()
        .skip(1)
        .filter_map(|value| value.into_string().ok())
        .collect();
    parse_arguments(&arguments)
}

#[tauri::command]
pub fn terminate_application<R: tauri::Runtime>(app: tauri::AppHandle<R>) {
    app.exit(0);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(args: &[&str]) -> StartupArguments {
        parse_arguments(
            &args
                .iter()
                .map(|value| (*value).to_owned())
                .collect::<Vec<_>>(),
        )
    }

    #[test]
    fn source_named_modes_accept_slashes_dashes_and_equals_spacing() {
        for args in [
            vec!["/modulo=t", "-artigos=1"],
            vec!["-modulo", "=t", "/artigos", "=", "1"],
            vec!["/modulo=", "t", "-artigos", "=1"],
            vec!["/modulo = t", "-artigos = 1"],
        ] {
            let value = parse(&args);
            assert_eq!(value.modulo.as_deref(), Some("t"));
            assert_eq!(value.artigos.as_deref(), Some("1"));
        }
        assert_eq!(parse(&["/modulo=m"]).modulo.as_deref(), Some("m"));
    }

    #[test]
    fn unrelated_unsupported_missing_and_duplicate_arguments_expose_no_raw_values() {
        for args in [
            vec![],
            vec!["/password=synthetic", "some-file"],
            vec!["/modulo=T", "/artigos=2"],
            vec!["/modulo", "/artigos"],
            vec!["/modulo=t", "-modulo=m", "/artigos=1", "-artigos=1"],
        ] {
            let value = parse(&args);
            assert_eq!(value.modulo, None);
            assert_eq!(value.artigos, None);
            assert_eq!(
                serde_json::to_value(value).unwrap(),
                serde_json::json!({"modulo":null,"artigos":null})
            );
        }
    }
}
