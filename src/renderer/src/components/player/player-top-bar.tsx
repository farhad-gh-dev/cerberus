import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PlayerTopBar({ title, backTo }: { title: string; backTo: string }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-b from-black/80 to-transparent p-4 pt-10 flex items-center gap-3 pointer-events-auto">
      <button
        onClick={() => navigate(backTo)}
        aria-label="Go back"
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-50"
      >
        <ArrowLeft size={18} />
      </button>
      <h2 className="text-sm font-medium text-white truncate">{title}</h2>
    </div>
  )
}
