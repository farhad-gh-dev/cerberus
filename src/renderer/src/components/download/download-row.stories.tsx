import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import type { DownloadItem } from '@shared/types'
import DownloadRow from './download-row'

const baseItem: DownloadItem = {
  id: 'download-1',
  name: 'Untitled Tommy Wirkola Project (2026) [720p] [web]',
  magnetLink: 'magnet:?xt=urn:btih:test-download-row',
  savePath: 'C:/Downloads',
  status: 'downloading',
  progress: 0.62,
  downloadSpeed: 2.6 * 1024 * 1024,
  uploadSpeed: 320 * 1024,
  downloaded: 4.96 * 1024 * 1024 * 1024,
  totalSize: 7.91 * 1024 * 1024 * 1024,
  timeRemaining: 1120,
  peers: 23,
  priority: 0
}

const meta: Meta<typeof DownloadRow> = {
  title: 'Components/Download/DownloadRow',
  component: DownloadRow,
  args: {
    item: baseItem,
    showQueueButton: true,
    draggable: false,
    isDragging: false,
    isDragOver: false
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/downloads']}>
        <div className="dark min-h-screen bg-zinc-950 p-6" style={{ width: 980 }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
}

export default meta
type Story = StoryObj<typeof DownloadRow>

export const Downloading: Story = {}

export const Queued: Story = {
  args: {
    item: {
      ...baseItem,
      status: 'queued',
      progress: 0.18,
      downloadSpeed: 0,
      uploadSpeed: 0,
      timeRemaining: 0,
      peers: 0,
      priority: 2
    }
  }
}

export const OnHold: Story = {
  args: {
    item: {
      ...baseItem,
      status: 'on-hold',
      progress: 0.37,
      downloadSpeed: 0,
      uploadSpeed: 0,
      timeRemaining: 0,
      peers: 0
    }
  }
}

export const Completed: Story = {
  args: {
    item: {
      ...baseItem,
      status: 'completed',
      progress: 1,
      downloaded: baseItem.totalSize,
      downloadSpeed: 0,
      uploadSpeed: 0,
      timeRemaining: 0
    },
    showQueueButton: false
  }
}

export const Failed: Story = {
  args: {
    item: {
      ...baseItem,
      status: 'error',
      progress: 0.31,
      timeRemaining: 0,
      peers: 0
    },
    showQueueButton: false
  }
}

export const Dragging: Story = {
  args: {
    draggable: true,
    isDragging: true
  }
}

export const DropTarget: Story = {
  args: {
    draggable: true,
    isDragOver: true
  }
}
