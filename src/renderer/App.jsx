import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Excalidraw,
  defaultLang,
  languages,
  loadFromBlob,
  serializeAsJSON,
} from "@excalidraw/excalidraw";

const createEmptyScene = () => ({
  elements: [],
  appState: { viewBackgroundColor: "#f4f2ef" },
  files: {},
});

const APP_I18N = {
  "pt-BR": {
    appTitle: "Excalidraw Desktop",
    fileSaved: "Salvo",
    fileDirty: "Nao salvo",
    untitled: "Sem titulo",
    project: "Projeto",
    version: "Versao",
    defaultFileName: "projeto",
    newTab: "Nova aba",
    open: "Abrir",
    save: "Salvar",
    saveAs: "Salvar como",
    language: "Idioma",
    openProjectTitle: "Abrir projeto",
    saveProjectTitle: "Salvar projeto",
    openError: "Nao foi possivel abrir este arquivo. Verifique se e um .excalidraw valido.",
    about: "Sobre",
    aboutTitle: "Sobre o app",
    versionLabel: "Versao",
    buildLabel: "Build",
    close: "Fechar",
  },
  en: {
    appTitle: "Excalidraw Desktop",
    fileSaved: "Saved",
    fileDirty: "Unsaved",
    untitled: "Untitled",
    project: "Project",
    version: "Version",
    defaultFileName: "project",
    newTab: "New tab",
    open: "Open",
    save: "Save",
    saveAs: "Save as",
    language: "Language",
    openProjectTitle: "Open project",
    saveProjectTitle: "Save project",
    openError: "Could not open this file. Please verify it is a valid .excalidraw file.",
    about: "About",
    aboutTitle: "About this app",
    versionLabel: "Version",
    buildLabel: "Build",
    close: "Close",
  },
  "es-ES": {
    appTitle: "Excalidraw Desktop",
    fileSaved: "Guardado",
    fileDirty: "No guardado",
    untitled: "Sin titulo",
    project: "Proyecto",
    version: "Version",
    defaultFileName: "proyecto",
    newTab: "Nueva pestaña",
    open: "Abrir",
    save: "Guardar",
    saveAs: "Guardar como",
    language: "Idioma",
    openProjectTitle: "Abrir proyecto",
    saveProjectTitle: "Guardar proyecto",
    openError: "No se pudo abrir este archivo. Verifica que sea un .excalidraw valido.",
    about: "Acerca de",
    aboutTitle: "Acerca de la app",
    versionLabel: "Version",
    buildLabel: "Build",
    close: "Cerrar",
  },
  "fr-FR": {
    appTitle: "Excalidraw Desktop",
    fileSaved: "Enregistre",
    fileDirty: "Non enregistre",
    untitled: "Sans titre",
    project: "Projet",
    version: "Version",
    defaultFileName: "projet",
    newTab: "Nouvel onglet",
    open: "Ouvrir",
    save: "Enregistrer",
    saveAs: "Enregistrer sous",
    language: "Langue",
    openProjectTitle: "Ouvrir le projet",
    saveProjectTitle: "Enregistrer le projet",
    openError: "Impossible d'ouvrir ce fichier. Verifiez qu'il s'agit d'un .excalidraw valide.",
    about: "A propos",
    aboutTitle: "A propos de l'app",
    versionLabel: "Version",
    buildLabel: "Build",
    close: "Fermer",
  },
};

const APP_LANG_CODES = Object.keys(APP_I18N);
const getStoredLang = () =>
  typeof window === "undefined" ? null : window.localStorage.getItem("app-lang");
const normalizeLangCode = (code) => {
  if (!code) return null;
  if (APP_I18N[code]) return code;
  if (code === "es") return "es-ES";
  if (code === "fr") return "fr-FR";
  if (code === "pt") return "pt-BR";
  return code;
};

const createNewTab = (overrides = {}) => {
  const id = crypto.randomUUID();
  return {
    id,
    title: overrides.title || APP_I18N["pt-BR"].untitled,
    filePath: overrides.filePath || null,
    scene: overrides.scene || createEmptyScene(),
    dirty: overrides.dirty ?? false,
  };
};

export default function App() {
  const supportedAppLanguages = useMemo(
    () => languages.filter((lang) => APP_LANG_CODES.includes(lang.code)),
    []
  );
  const initialLang =
    normalizeLangCode(getStoredLang()) ||
    supportedAppLanguages.find((lang) => lang.code === "pt-BR")?.code ||
    supportedAppLanguages[0]?.code ||
    defaultLang.code ||
    "en";
  const [uiLang, setUiLang] = useState(initialLang);
  const [appInfo, setAppInfo] = useState({ version: "", platform: "", arch: "" });
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [tabs, setTabs] = useState([
    createNewTab({ title: APP_I18N[initialLang]?.untitled ?? APP_I18N.en.untitled }),
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const programmaticUpdate = useRef(false);
  const tabsRef = useRef(tabs);
  const activeTabIdRef = useRef(activeTabId);

  const t = useCallback(
    (key) => APP_I18N[uiLang]?.[key] ?? APP_I18N.en[key] ?? key,
    [uiLang]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("app-lang", uiLang);
  }, [uiLang]);

  useEffect(() => {
    let isMounted = true;
    if (window?.excalidrawDesktop?.getAppInfo) {
      window.excalidrawDesktop
        .getAppInfo()
        .then((info) => {
          if (isMounted && info) {
            setAppInfo({
              version: info.version || "",
              platform: info.platform || "",
              arch: info.arch || "",
            });
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId),
    [tabs, activeTabId]
  );

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    activeTabIdRef.current = activeTabId;
  }, [activeTabId]);

  useEffect(() => {
    if (!excalidrawAPI) return;
    const tab = tabsRef.current.find((item) => item.id === activeTabId);
    if (!tab) return;
    programmaticUpdate.current = true;
    excalidrawAPI.updateScene(tab.scene);
  }, [excalidrawAPI, activeTabId]);

  const updateActiveTabScene = useCallback((sceneUpdater) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabIdRef.current
          ? {
              ...tab,
              ...sceneUpdater(tab),
            }
          : tab
      )
    );
  }, []);

  const handleChange = useCallback(
    (elements, appState, files) => {
      if (programmaticUpdate.current) {
        programmaticUpdate.current = false;
        return;
      }
      updateActiveTabScene((tab) => ({
        scene: { elements, appState, files },
        dirty: true,
      }));
    },
    [updateActiveTabScene]
  );

  const handleNewTab = () => {
    const newTab = createNewTab({ title: t("untitled") });
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (id) => {
    if (tabs.length === 1) return;

    setTabs((prev) => {
      const remaining = prev.filter((tab) => tab.id !== id);
      if (activeTabId === id && remaining.length > 0) {
        setActiveTabId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleOpen = async () => {
    const result = await window.excalidrawDesktop.openFile({
      title: t("openProjectTitle"),
    });
    if (!result) return;

    try {
      const blob = new Blob([result.contents], { type: "application/json" });
      const scene = await loadFromBlob(blob, null, null);
      const title = result.filePath.split("/").pop() || t("project");
      const newTab = createNewTab({
        title,
        filePath: result.filePath,
        scene: {
          elements: scene.elements,
          appState: scene.appState,
          files: scene.files,
        },
        dirty: false,
      });

      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    } catch (error) {
      console.error("Falha ao abrir arquivo:", error);
      alert(t("openError"));
    }
  };

  const buildPayload = (tab) =>
    serializeAsJSON(tab.scene.elements, tab.scene.appState, tab.scene.files, "local");

  const formatPath = (filePath) => {
    if (!filePath) return null;
    const parts = filePath.split("/").filter(Boolean);
    if (parts.length <= 2) return filePath;
    return `…/${parts.slice(-2).join("/")}`;
  };

  const getDefaultFileName = () =>
    `${APP_I18N[uiLang]?.defaultFileName ?? APP_I18N.en.defaultFileName}.excalidraw`;

  const handleSave = async () => {
    if (!activeTab) return;

    const payload = buildPayload(activeTab);

    const result = await window.excalidrawDesktop.saveFile({
      filePath: activeTab.filePath,
      contents: payload,
      title: t("saveProjectTitle"),
      defaultName: getDefaultFileName(),
    });

    if (!result) return;

    const title = result.filePath.split("/").pop() || t("project");

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              filePath: result.filePath,
              title,
              dirty: false,
            }
          : tab
      )
    );
  };

  const handleSaveAs = async () => {
    if (!activeTab) return;

    const payload = buildPayload(activeTab);

    const result = await window.excalidrawDesktop.saveFile({
      filePath: null,
      contents: payload,
      title: t("saveProjectTitle"),
      defaultName: getDefaultFileName(),
    });

    if (!result) return;

    const title = result.filePath.split("/").pop() || t("project");

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              filePath: result.filePath,
              title,
              dirty: false,
            }
          : tab
      )
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand">{t("appTitle")}</div>
          {activeTab && (
            <div className={`file-chip ${activeTab.dirty ? "dirty" : ""}`}>
              <span className={`status-dot ${activeTab.dirty ? "dirty" : "clean"}`} />
              <span className="file-name">{activeTab.title}</span>
              <span className="file-status">
                {activeTab.dirty ? t("fileDirty") : t("fileSaved")}
              </span>
              {activeTab.filePath && (
                <span className="file-path">{formatPath(activeTab.filePath)}</span>
              )}
            </div>
          )}
        </div>
        <div className="actions">
          <div className="action-group">
            <button className="btn ghost" onClick={handleNewTab}>
              {t("newTab")}
            </button>
          </div>
          <div className="action-group">
            <button className="btn ghost" onClick={handleOpen}>
              {t("open")}
            </button>
            <button className="btn primary" onClick={handleSave}>
              {t("save")}
            </button>
            <button className="btn" onClick={handleSaveAs}>
              {t("saveAs")}
            </button>
          </div>
          <div className="action-group">
            <label className="lang-label" htmlFor="lang-select">
              {t("language")}
            </label>
            <select
              id="lang-select"
              className="lang-select"
              value={uiLang}
              onChange={(event) => setUiLang(event.target.value)}
            >
              {supportedAppLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="action-group">
            <button className="btn ghost" onClick={() => setIsAboutOpen(true)}>
              {t("about")}
            </button>
          </div>
        </div>
      </header>

      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? "active" : ""}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="tab-title">
              {tab.title}
              {tab.dirty ? " *" : ""}
            </span>
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCloseTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <main className="canvas-area">
        <Excalidraw
          excalidrawAPI={setExcalidrawAPI}
          onChange={handleChange}
          langCode={uiLang}
        />
      </main>
      <footer className="status-bar">
        <div className="status-right">
          {appInfo.version && (
            <span className="status-pill">
              {t("version")} v{appInfo.version}
            </span>
          )}
          {appInfo.platform && appInfo.arch && (
            <span className="status-pill">
              {appInfo.platform}/{appInfo.arch}
            </span>
          )}
        </div>
      </footer>
      {isAboutOpen && (
        <div className="modal-backdrop" onClick={() => setIsAboutOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">{t("aboutTitle")}</div>
            <div className="modal-body">
              <div className="modal-row">
                <span className="modal-label">{t("versionLabel")}</span>
                <span className="modal-value">v{appInfo.version || "0.1.0"}</span>
              </div>
              <div className="modal-row">
                <span className="modal-label">{t("buildLabel")}</span>
                <span className="modal-value">
                  {appInfo.platform || "unknown"} / {appInfo.arch || "unknown"}
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setIsAboutOpen(false)}>
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
