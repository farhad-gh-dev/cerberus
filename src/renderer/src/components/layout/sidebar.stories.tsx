import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './sidebar'
import { useThemeStore } from '../../stores/theme'
import { useDownloadsStore } from '../../stores/downloads'
import type { DownloadItem } from '@shared/types'

const mockDownloadingItem: DownloadItem = {
  id: '1',
  name: 'Mock Download',
  magnetLink: 'magnet:?xt=urn:btih:mock',
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

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <div style={{ height: '100vh', display: 'flex' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
}

export const LibraryActive: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/library']}>
        <div style={{ height: '100vh', display: 'flex' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
}

export const DownloadsActive: Story = {
  decorators: [
    (Story) => {
      useDownloadsStore.setState({
        ids: [mockDownloadingItem.id],
        byId: { [mockDownloadingItem.id]: mockDownloadingItem }
      })
      return (
        <MemoryRouter initialEntries={['/downloads']}>
          <div style={{ height: '100vh', display: 'flex' }}>
            <Story />
          </div>
        </MemoryRouter>
      )
    }
  ]
}

export const SettingsActive: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/settings']}>
        <div style={{ height: '100vh', display: 'flex' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
}

export const LightTheme: Story = {
  decorators: [
    (Story) => {
      useThemeStore.setState({ theme: 'light' })
      return (
        <MemoryRouter initialEntries={['/']}>
          <div style={{ height: '100vh', display: 'flex' }}>
            <Story />
          </div>
        </MemoryRouter>
      )
    }
  ]
}

export const LightThemeLibraryActive: Story = {
  decorators: [
    (Story) => {
      useThemeStore.setState({ theme: 'light' })
      return (
        <MemoryRouter initialEntries={['/library']}>
          <div style={{ height: '100vh', display: 'flex' }}>
            <Story />
          </div>
        </MemoryRouter>
      )
    }
  ]
}
