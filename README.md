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
  <img src="screenshots/movie-details.png" width="40%" alt="Download Detail" />
  <img src="screenshots/stream.png" width="40%" alt="Downloads" />
</p>
<p align="center">
  <img src="screenshots/downloads.png" width="40%" alt="Magnet Modal" />
  <img src="screenshots/download-detail.png" width="40%" alt="Settings" />
</p>

---

## Overview

Cerberus is an all-in-one desktop application for discovering, downloading, streaming, and watching movies. It combines a torrent client powered by WebTorrent with a rich movie discovery interface backed by TMDb and YTS, a personal movie library, a built-in video player with subtitle support, real-time download analytics — including a 3D peer globe and live speed charts — and the ability to stream torrents directly without waiting for the full download.

## Features

- **Movie Discovery** — Search and browse trending movies via the TMDb API. View detailed metadata including cast, crew, ratings, plot summaries, and backdrop images. Torrent availability is checked automatically before displaying results.
- **Torrent Search & Download** — Search for torrents through the YTS source (pluggable architecture for additional sources). Start downloads from magnet links with pause, resume, cancel, and delete controls. Duplicate magnet detection prevents re-downloading the same torrent.
- **Download Queue** — Configurable max concurrent downloads (default: 2). Priority-based queue with reordering and hold/unhold support. Download state is persisted and automatically restored on app restart.
- **Torrent Streaming** — Stream torrents directly from a magnet link without downloading the full file first. Sequential download strategy with first/last piece prioritization for MP4 moov atom handling. Managed streaming sessions with file-level prioritization.
- **Personal Library** — Automatically adds completed downloads to your library. Manually add existing movies from your device. Search and filter your collection. Smart video file resolution that searches subdirectories for the largest video file.
- **Built-in Video Player** — Watch movies directly inside the app with a custom HTML5 player featuring keyboard shortcuts, playback speed control (0.25×–2×), seek bar, and volume control. Alternatively, launch an external player of your choice (e.g., VLC, mpv).
- **Subtitles** — Search and download subtitles via two providers: OpenSubtitles and Subdl. Filter by language, auto-convert SRT to VTT for HTML5 playback, and automatically discover local subtitle files (SRT, VTT, ASS, SSA, SUB). Provider selection is configurable in Settings.
- **Real-time Download Analytics** — Live speed charts for upload and download bandwidth. Interactive 3D globe visualization showing peer locations worldwide. Per-peer stats including client name, speed, progress, and geolocation. Country-level peer distribution breakdown.
- **Local Video Server** — Built-in HTTP server with range-request support for seamless video streaming of local files (supports MP4, MKV, AVI, MOV, WebM, M4V, WMV).
- **Peer Geolocation** — Batch IP geolocation via ip-api.com supporting up to 100 IPs per request. Smart batching with debounce, in-memory caching, and automatic filtering of private/local IP addresses.
- **Cross-platform** — Builds for Windows (NSIS installer), macOS (DMG), and Linux (AppImage, Snap, Deb).

## Tech Stack

| Layer            | Technology                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Framework        | [Electron](https://www.electronjs.org/) 39 + [electron-vite](https://electron-vite.org/) |
| Frontend         | [React](https://react.dev/) 19, [React Router](https://reactrouter.com/) 7               |
| Language         | [TypeScript](https://www.typescriptlang.org/) 5.9                                        |
| Styling          | [Tailwind CSS](https://tailwindcss.com/) 4, [Lucide Icons](https://lucide.dev/)          |
| State Management | [Zustand](https://zustand.docs.pmnd.rs/) 5                                               |
| Torrent Engine   | [WebTorrent](https://webtorrent.io/) 2                                                   |
| 3D Visualization | [Three.js](https://threejs.org/), [Cobe](https://cobe.vercel.app/)                       |
| Movie Data       | [TMDb API](https://www.themoviedb.org/documentation/api), [YTS API](https://yts.mx/api)  |
| Subtitles        | [OpenSubtitles API](https://www.opensubtitles.com/), [Subdl API](https://subdl.com/)     |
| Geolocation      | [ip-api.com](http://ip-api.com/) (batch endpoint)                                        |
| HTTP Requests    | [Axios](https://axios-http.com/)                                                         |
| Bundler          | [Vite](https://vite.dev/) 7                                                              |
| Linting          | [ESLint](https://eslint.org/) 9, [Prettier](https://prettier.io/)                        |
| Packaging        | [electron-builder](https://www.electron.build/)                                          |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9 (or your preferred package manager)
- A [TMDb API key](https://www.themoviedb.org/settings/api) (free) — required for movie discovery and metadata
- _(Optional)_ An [OpenSubtitles API key](https://www.opensubtitles.com/en/consumers) — for subtitle search and download via OpenSubtitles

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

- **Main Process** — Manages the WebTorrent client, download lifecycle and queue, TMDb/YTS API calls, subtitle fetching (OpenSubtitles & Subdl), torrent streaming sessions, a local HTTP video server, IP geolocation, and JSON-based persistence. IPC handlers expose these capabilities to the renderer.
- **Preload Script** — Provides a secure `window.api` bridge using Electron's `contextBridge`, exposing typed IPC methods without granting the renderer direct access to Node.js APIs.
- **Renderer Process** — A React SPA with client-side routing (HashRouter). Uses Zustand for state management, Tailwind CSS for styling, Three.js/Cobe for the 3D peer globe, and a custom HTML5 video player with subtitle support.

```
src/
├── main/                  # Main process
│   ├── config/            # Tracker lists, window configuration
│   ├── db/                # JSON-based library persistence
│   ├── ipc/               # IPC handlers (downloads, library, movies, settings, streaming, subtitles, torrents)
│   ├── services/          # Core services (download manager, streaming, video server, TMDb, geolocation, subtitles, etc.)
│   └── types/             # TMDb types, WebTorrent declarations
├── preload/               # Secure contextBridge API
├── renderer/              # React frontend
│   └── src/
│       ├── components/    # UI components (player, globe, modals, download rows, etc.)
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Route pages (home, library, downloads, player, settings)
│       ├── stores/        # Zustand stores (downloads, settings, toast)
│       └── utils/         # Shared utilities
└── shared/                # Types shared between main and renderer
```

## License

This project is provided as-is for personal and educational use.
