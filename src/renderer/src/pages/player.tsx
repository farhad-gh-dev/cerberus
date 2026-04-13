import { useSearchParams } from 'react-router-dom'
import { PlayerProvider } from '../components/player/player-context'
import PlayerContent from '../components/player/player-content'

export default function Player() {
  const [searchParams] = useSearchParams()

  const filePath = searchParams.get('file')
  const streamId = searchParams.get('streamId') || undefined
  const title = searchParams.get('title') || 'Unknown'
  const backTo = searchParams.get('back') || '/library'
  const imdbId = searchParams.get('imdbId') || undefined

  return (
    <PlayerProvider filePath={filePath} backTo={backTo} imdbId={imdbId} streamId={streamId}>
      <PlayerContent title={title} backTo={backTo} />
    </PlayerProvider>
  )
}
