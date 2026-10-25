use serde::Deserialize;

#[derive(Clone, Copy, Deserialize)]
pub(super) enum Encoding {
    #[serde(rename = "utf-8")]
    Utf8,
    #[serde(rename = "windows-1252")]
    Windows1252,
    #[serde(rename = "utf-16le")]
    Utf16Le,
}

// Explicit deployment encodings, not a claim about the unrecorded WINDEV runtime setting.
// No BOM sniffing/removal, replacement character, normalization or decoder fallback.
pub(super) fn decode(bytes: &[u8], encoding: Encoding) -> Result<String, ()> {
    match encoding {
        Encoding::Utf8 => String::from_utf8(bytes.to_vec()).map_err(|_| ()),
        Encoding::Utf16Le => {
            let (pairs, remainder) = bytes.as_chunks::<2>();
            if !remainder.is_empty() {
                return Err(());
            }
            char::decode_utf16(pairs.iter().map(|pair| u16::from_le_bytes(*pair)))
                .collect::<Result<String, _>>()
                .map_err(|_| ())
        }
        Encoding::Windows1252 => {
            // Microsoft CP1252 mapping, including its five undefined byte positions:
            // https://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP1252.TXT
            const C1: [u16; 32] = [
                0x20ac, 0, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
                0x2039, 0x0152, 0, 0x017d, 0, 0, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013,
                0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0, 0x017e, 0x0178,
            ];
            bytes
                .iter()
                .map(|&byte| {
                    let code = if (0x80..=0x9f).contains(&byte) {
                        C1[(byte - 0x80) as usize]
                    } else {
                        byte as u16
                    };
                    if code == 0 && byte != 0 {
                        return Err(());
                    }
                    char::from_u32(code as u32).ok_or(())
                })
                .collect()
        }
    }
}
