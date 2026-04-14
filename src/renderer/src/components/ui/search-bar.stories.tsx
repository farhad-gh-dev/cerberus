import type { Meta, StoryObj } from '@storybook/react-vite'
import SearchBar from './search-bar'

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
  argTypes: {
    onSearch: { action: 'search' },
    onReset: { action: 'reset' }
  }
}

export default meta
type Story = StoryObj<typeof SearchBar>

export const Default: Story = {
  args: {
    placeholder: 'Search movies...'
  }
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Find a torrent...'
  }
}
