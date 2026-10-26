fn main() {
    tauri_build::build();
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("macos") {
        cc::Build::new()
            .file("src/commands/report_output/macos.m")
            .flag("-fobjc-arc")
            .compile("gestao_report_output");
        println!("cargo:rustc-link-lib=framework=AppKit");
        println!("cargo:rustc-link-lib=framework=PDFKit");
        println!("cargo:rerun-if-changed=src/commands/report_output/macos.m");
    }
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows")
        && std::env::var("CARGO_CFG_TARGET_ENV").as_deref() == Ok("msvc")
    {
        let manifest =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("windows-test.manifest.xml");
        println!("cargo:rerun-if-changed={}", manifest.display());
        // Library unit-test harnesses are lib targets, so test-target-only flags miss them.
        println!("cargo:rustc-link-arg=/MANIFEST:EMBED");
        println!("cargo:rustc-link-arg=/MANIFESTINPUT:{}", manifest.display());
        // Tauri already supplies its manifest resource for binary targets.
        println!("cargo:rustc-link-arg-bins=/MANIFEST:NO");
    }
}
