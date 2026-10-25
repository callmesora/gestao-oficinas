pub const PLAY_MESSAGE_SOUND_COMMAND: &str = "play_message_sound";

// WINDEVMESSAGEBOX.AvertissementSonore: Windows only; warning uses Asterisk.
fn sound_kind(message_type: u8) -> Result<u32, String> {
    match message_type {
        0 | 4 => Ok(0x40),
        1 => Ok(0x10),
        2 | 3 | 5 => Ok(0x20),
        _ => Err("invalid_message_type".into()),
    }
}

#[tauri::command]
pub fn play_message_sound(message_type: u8) -> Result<(), String> {
    let sound = sound_kind(message_type)?;
    #[cfg(target_os = "windows")]
    {
        // https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messagebeep
        // Fixed system enum only; the OS owns sound settings and asynchronous playback.
        if unsafe { windows_sys::Win32::System::Diagnostics::Debug::MessageBeep(sound) } == 0 {
            return Err("message_sound_unavailable".into());
        }
    }
    #[cfg(not(target_os = "windows"))]
    let _ = sound;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn source_sound_mapping_and_invalid_types() {
        assert_eq!(
            (0..6)
                .map(sound_kind)
                .collect::<Result<Vec<_>, _>>()
                .unwrap(),
            vec![0x40, 0x10, 0x20, 0x20, 0x40, 0x20]
        );
        assert!(sound_kind(6).is_err());
        assert!(sound_kind(255).is_err());
    }
}
