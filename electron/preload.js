const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("excalidrawDesktop", {
  openFile: (payload) => ipcRenderer.invoke("open-file", payload),
  saveFile: (payload) => ipcRenderer.invoke("save-file", payload),
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
});
