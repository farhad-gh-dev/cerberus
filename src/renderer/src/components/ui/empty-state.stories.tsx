import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox, Film, Search } from 'lucide-react'
import EmptyState from './empty-state'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  decorators: [
    (Story) => (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    icon: <Inbox size={48} />,
    title: 'No downloads yet',
    subtitle: 'Your downloads will appear here'
  }
}

export const WithAction: Story = {
  args: {
    icon: <Film size={48} />,
    title: 'Your library is empty',
    subtitle: 'Search for movies to add them to your library',
    action: (
      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
        Browse Movies
      </button>
    )
  }
}

export const NoSubtitle: Story = {
  args: {
    icon: <Search size={48} />,
    title: 'No results found'
  }
}
