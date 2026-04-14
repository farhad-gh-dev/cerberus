import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/layout'
import Home from './pages/home'
import Library from './pages/library'
import LibraryDetail from './pages/library-detail'
import Downloads from './pages/downloads'
import DownloadDetail from './pages/download-detail'
import Settings from './pages/settings'
import Player from './pages/player'
import LoadingSpinner from './components/ui/loading-spinner'

// Dev-only preview pages (lazy loaded)
const isDev = import.meta.env.DEV
const MapPreview = isDev ? lazy(() => import('./pages/map-preview')) : null
const ChartPreview = isDev ? lazy(() => import('./pages/chart-preview')) : null

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:imdbId" element={<LibraryDetail />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/downloads/:downloadId" element={<DownloadDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/player" element={<Player />} />
          {isDev && MapPreview && (
            <Route
              path="/map-preview"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MapPreview />
                </Suspense>
              }
            />
          )}
          {isDev && ChartPreview && (
            <Route
              path="/chart-preview"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ChartPreview />
                </Suspense>
              }
            />
          )}
        </Route>
      </Routes>
    </HashRouter>
  )
}
