import type { Meta, StoryObj } from '@storybook/react-vite'
import type { DownloadItem } from '@shared/types'
import ProgressBar from './download-progress-bar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/DownloadProgressBar',
  component: ProgressBar,
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof ProgressBar>

const baseItem: DownloadItem = {
  id: '1',
  name: 'Test Download',
  magnetLink: 'magnet:?xt=urn:btih:test',
  savePath: '/downloads',
  status: 'downloading',
  progress: 0.45,
  downloadSpeed: 1024 * 1024,
  uploadSpeed: 512 * 1024,
  downloaded: 450 * 1024 * 1024,
  totalSize: 1024 * 1024 * 1024,
  timeRemaining: 600,
  peers: 12,
  priority: 0
}

export const Downloading: Story = {
  args: { item: { ...baseItem, status: 'downloading', progress: 0.45 } }
}

export const Completed: Story = {
  args: { item: { ...baseItem, status: 'completed', progress: 1 } }
}

export const Paused: Story = {
  args: { item: { ...baseItem, status: 'paused', progress: 0.6 } }
}

export const Queued: Story = {
  args: { item: { ...baseItem, status: 'queued', progress: 0 } }
}

export const QueuedPartial: Story = {
  args: { item: { ...baseItem, status: 'queued', progress: 0.3 } }
}

export const OnHold: Story = {
  args: { item: { ...baseItem, status: 'on-hold', progress: 0 } }
}

export const Error: Story = {
  args: { item: { ...baseItem, status: 'error', progress: 0.2 } }
}
