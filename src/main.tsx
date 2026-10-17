import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted fonts (SIL OFL). Latin subset only; Inter is the variable font.
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/inter/wght.css";
import "./index.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
