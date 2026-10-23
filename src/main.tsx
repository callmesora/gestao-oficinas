import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { installBrowserPreview } from "./infrastructure/preview";

const preview = installBrowserPreview();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode><App preview={preview} /></React.StrictMode>,
);
