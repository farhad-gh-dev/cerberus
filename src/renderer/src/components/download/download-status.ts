import { Clock, CircleOff } from 'lucide-react'
import type { DownloadItem } from '@shared/types'

export type DownloadStatus = DownloadItem['status']

export const statusLabel: Record<DownloadStatus, string> = {
  downloading: 'Downloading',
  paused: 'Paused',
  completed: 'Completed',
  error: 'Error',
  queued: 'Queued',
  'on-hold': 'On Hold'
}

export const statusColor: Record<DownloadStatus, string> = {
  downloading: 'text-blue-400',
  paused: 'text-yellow-400',
  completed: 'text-green-400',
  error: 'text-red-400',
  queued: 'text-zinc-400',
  'on-hold': 'text-orange-400'
}

export const statusIcon: Partial<Record<DownloadStatus, typeof Clock>> = {
  queued: Clock,
  'on-hold': CircleOff
}

export const barColor: Record<DownloadStatus, string> = {
  completed: 'bg-green-500',
  'on-hold': 'bg-orange-500/60',
  queued: 'bg-zinc-500',
  downloading: 'bg-blue-500',
  paused: 'bg-blue-500',
  error: ''
}
