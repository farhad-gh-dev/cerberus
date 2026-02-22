import { useSearchParams } from 'react-router-dom'
import { PlayerProvider } from '../components/player/player-context'
import PlayerContent from '../components/player/player-content'

export default function Player() {
  const [searchParams] = useSearchParams()

  const filePath = searchParams.get('file')
  const title = searchParams.get('title') || 'Unknown'
  const backTo = searchParams.get('back') || '/library'

  return (
    <PlayerProvider filePath={filePath} backTo={backTo}>
      <PlayerContent title={title} backTo={backTo} />
    </PlayerProvider>
  )
}
