import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
export default tseslint.config(
  { ignores: ["src/bindings/**", "src/assets/**", "legacy/**", "GestaoOficinas_TesteIA/**", "analysis-local/**", "migrate-windev-javascript/**", ".venv/**", "templates/**", "src-tauri/**", "dist/**", "ui-report/**", "test-results/**", "playwright-report/**", "scripts/py.mjs", "setup/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["**/*.{js,mjs,ts,tsx}"], languageOptions: { globals: { process: "readonly", console: "readonly", window: "readonly", document: "readonly", fetch: "readonly" } } },
  { files: ["src/**/*.{ts,tsx}"], plugins: { "react-hooks": reactHooks }, rules: { ...reactHooks.configs.recommended.rules } },
);
