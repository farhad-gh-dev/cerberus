import { X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useToastStore } from '../../stores/toast'

export default function Toast() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : 'bg-green-950/90 border-green-800 text-green-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
          ) : (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-400" />
          )}
          <p className="text-sm flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
