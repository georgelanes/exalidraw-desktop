# Excalidraw Desktop

Desktop client for Excalidraw with multi‑tab support, open/save `.excalidraw` projects, and a multilingual shell UI.

## Stack

- Electron (desktop app)
- Vite + React (renderer)
- `@excalidraw/excalidraw` (editor)

## Features

- Multiple tabs with independent state
- Open and save `.excalidraw` projects
- Multilingual app shell (pt-BR, en, es-ES, fr-FR)
- Excalidraw i18n via `langCode`
- Excalidraw assets served locally (offline)
- macOS app menu removed (minimal app menu only)
- Version/build info in the footer
- “About” modal with version + build (platform/arch)

## Requirements

- Bun 1.2+ (recommended)
- Node.js 18+ (for Electron/CLI if needed)

## Clone

```bash
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
```

## Install dependencies

```bash
bun install
```

## Run in development

```bash
bun run dev
```

## Build renderer

```bash
bun run build
```

## Run app (Electron)

```bash
bun run start
```

> For production renderer, run `build` before `start`.

## Package (macOS, Windows, Linux)

```bash
bun run dist
```

Build outputs are generated in `dist/`.

## Branding (icons)

Icons are loaded from `build/`:

- `build/icon.png` (512x512)
- `build/icon.icns` (macOS)
- `build/icon.ico` (Windows)

The project includes a basic `icon.png`. Replace with your official branding before release.

## Languages

- Excalidraw supports i18n natively.
- The app shell uses a local dictionary (`APP_I18N`) and a dropdown switcher.
- To add languages: add to `APP_I18N` and ensure the code exists in Excalidraw `languages`.

## Local assets

Excalidraw assets are served locally from:

`/excalidraw-assets/`

This folder is copied from `node_modules/@excalidraw/excalidraw/dist/excalidraw-assets` and served by Vite. The app points to it via `window.EXCALIDRAW_ASSET_PATH`.

## License

MIT (same as Excalidraw).
