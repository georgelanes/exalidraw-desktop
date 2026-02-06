import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

window.EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
