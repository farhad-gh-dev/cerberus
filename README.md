<p align="center">
  <img src="resources/icon.png" width="100" alt="Cerberus logo" />
</p>

<h1 align="center">Cerberus</h1>

<p align="center">
  A modern desktop torrent client and movie manager built with Electron, React, and TypeScript.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-39-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-lightgrey" alt="Platform" />
</p>

<p align="center">
  <img src="screenshots/discover.png" width="40%" alt="Discover" />
  <img src="screenshots/library.png" width="40%" alt="Library" />
</p>
<p align="center">
  <img src="screenshots/download-detail.png" width="40%" alt="Download Detail" />
  <img src="screenshots/downloads.png" width="40%" alt="Downloads" />
</p>

---

## Overview

Cerberus is an all-in-one desktop application for discovering, downloading, and watching movies. It combines a torrent client powered by WebTorrent with a rich movie discovery interface backed by TMDb and YTS, a personal movie library, a built-in video player, and real-time download analytics — including a 3D peer globe and live speed charts.

## Features

- **Movie Discovery** — Search and browse trending movies via the TMDb API. View detailed metadata including cast, crew, ratings, and plot summaries.
- **Torrent Search & Download** — Search for torrents through the YTS source (pluggable architecture for additional sources). Start downloads from magnet links with pause, resume, and cancel controls.
- **Personal Library** — Automatically adds completed downloads to your library. Manually add existing movies from your device. Search and filter your collection.
- **Built-in Video Player** — Watch movies directly inside the app with a custom player featuring keyboard shortcuts, playback speed control, seek bar, and volume control. Alternatively, launch an external player of your choice (e.g., VLC, mpv).
- **Real-time Download Analytics** — Live speed charts for upload and download bandwidth. Interactive 3D globe visualization showing peer locations worldwide. Per-peer stats including client name, speed, progress, and geolocation. Country-level peer distribution breakdown.
- **Local Video Server** — Built-in HTTP server with range-request support for seamless video streaming of local files (supports MP4, MKV, AVI, MOV, WebM, M4V, WMV).
- **Cross-platform** — Builds for Windows (NSIS installer), macOS (DMG), and Linux (AppImage, Snap, Deb).

## Tech Stack

| Layer            | Technology                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Framework        | [Electron](https://www.electronjs.org/) 39 + [electron-vite](https://electron-vite.org/) |
| Frontend         | [React](https://react.dev/) 19, [React Router](https://reactrouter.com/) 7               |
| Language         | [TypeScript](https://www.typescriptlang.org/) 5.9                                        |
| Styling          | [Tailwind CSS](https://tailwindcss.com/) 4, [Lucide Icons](https://lucide.dev/)          |
| State Management | [Zustand](https://zustand.docs.pmnd.rs/)                                                 |
| Torrent Engine   | [WebTorrent](https://webtorrent.io/)                                                     |
| 3D Visualization | [Three.js](https://threejs.org/), [Cobe](https://cobe.vercel.app/)                       |
| Movie Data       | [TMDb API](https://www.themoviedb.org/documentation/api), [YTS API](https://yts.mx/api)  |
| Geolocation      | [ip-api.com](http://ip-api.com/) (batch endpoint)                                        |
| Bundler          | [Vite](https://vite.dev/) 7                                                              |
| Linting          | [ESLint](https://eslint.org/) 9, [Prettier](https://prettier.io/)                        |
| Packaging        | [electron-builder](https://www.electron.build/)                                          |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9 (or your preferred package manager)
- A [TMDb API key](https://www.themoviedb.org/settings/api) (free) — required for movie discovery and metadata

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/cerberus.git
cd cerberus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your TMDb API key

Launch the app and navigate to **Settings** to enter your TMDb API key, or create a `settings.json` in your OS user-data directory with:

```json
{
  "tmdbApiKey": "<YOUR_TMDB_API_KEY>"
}
```

### 4. Start development

```bash
npm run dev
```

## Available Scripts

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the app in development mode with hot-reload |
| `npm run build`       | Type-check and build the app for production       |
| `npm run build:win`   | Build and package for Windows (NSIS installer)    |
| `npm run build:mac`   | Build and package for macOS (DMG)                 |
| `npm run build:linux` | Build and package for Linux (AppImage, Snap, Deb) |
| `npm run start`       | Preview the production build                      |
| `npm run typecheck`   | Run TypeScript type checking (Node + Web)         |
| `npm run lint`        | Lint the codebase with ESLint                     |
| `npm run format`      | Format the codebase with Prettier                 |

## Architecture

Cerberus follows Electron's multi-process architecture with a clear separation of concerns:

- **Main Process** — Manages the WebTorrent client, download lifecycle, TMDb/YTS API calls, a local HTTP video server, IP geolocation, and JSON-based persistence. IPC handlers expose these capabilities to the renderer.
- **Preload Script** — Provides a secure `window.api` bridge using Electron's `contextBridge`, exposing typed IPC methods without granting the renderer direct access to Node.js APIs.
- **Renderer Process** — A React SPA with client-side routing (HashRouter). Uses Zustand for state management, Tailwind CSS for styling, Three.js for the 3D peer globe, and a custom HTML5 video player.

## License

This project is provided as-is for personal and educational use.
