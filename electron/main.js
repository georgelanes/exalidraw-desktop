import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMac = process.platform === "darwin";
const APP_NAME = "Excalidraw Desktop";

let mainWindow;

function applyAppMenu() {
  if (isMac) {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: APP_NAME,
          submenu: [{ role: "quit" }],
        },
      ])
    );
  } else {
    Menu.setApplicationMenu(null);
  }
}

function getRendererUrl() {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) return devServerUrl;

  const indexPath = path.join(app.getAppPath(), "dist", "renderer", "index.html");
  return new URL(`file://${indexPath}`).toString();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: APP_NAME,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(getRendererUrl());
  applyAppMenu();
}

app.whenReady().then(() => {
  app.name = APP_NAME;
  if (typeof app.setName === "function") {
    app.setName(APP_NAME);
  }
  process.title = APP_NAME;
  applyAppMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle("open-file", async (_event, payload = {}) => {
  const { title } = payload;
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: title || "Abrir projeto",
    properties: ["openFile"],
    filters: [
      { name: "Excalidraw", extensions: ["excalidraw", "json"] },
      { name: "Todos os arquivos", extensions: ["*"] },
    ],
  });

  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
  const contents = await fs.readFile(filePath, "utf-8");
  return { filePath, contents };
});

ipcMain.handle("save-file", async (_event, { filePath, contents, title, defaultName } = {}) => {
  let targetPath = filePath;

  if (!targetPath) {
    const { canceled, filePath: newPath } = await dialog.showSaveDialog({
      title: title || "Salvar projeto",
      defaultPath: defaultName || "projeto.excalidraw",
      filters: [{ name: "Excalidraw", extensions: ["excalidraw"] }],
    });

    if (canceled || !newPath) return null;
    targetPath = newPath;
  }

  await fs.writeFile(targetPath, contents, "utf-8");
  return { filePath: targetPath };
});

ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-app-info", () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
}));
