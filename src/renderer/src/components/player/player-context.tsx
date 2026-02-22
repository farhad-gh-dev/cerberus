import { createContext, useContext, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayer } from './use-player'

type PlayerState = ReturnType<typeof usePlayer>

const PlayerContext = createContext<PlayerState | null>(null)

interface PlayerProviderProps {
  filePath: string | null
  backTo: string
  children: ReactNode
}

export function PlayerProvider({ filePath, backTo, children }: PlayerProviderProps) {
  const navigate = useNavigate()
  const player = usePlayer(filePath, navigate, backTo)
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
}

export function usePlayerContext(): PlayerState {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayerContext must be used within PlayerProvider')
  return ctx
}
