import type { Meta, StoryObj } from '@storybook/react-vite'
import LibraryActions from './library-actions'

const meta: Meta<typeof LibraryActions> = {
  title: 'Components/LibraryActions',
  component: LibraryActions,
  argTypes: {
    onPlay: { action: 'play' },
    onOpenFolder: { action: 'openFolder' },
    onFindTorrents: { action: 'findTorrents' },
    onRemove: { action: 'remove' },
    onStream: { action: 'stream' }
  },
  decorators: [
    (Story) => (
      <div className="flex gap-3">
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof LibraryActions>

export const WithFile: Story = {
  args: {
    hasFile: true,
    playDisabled: false
  }
}

export const WithoutFile: Story = {
  args: {
    hasFile: false,
    playDisabled: false
  }
}

export const WithFileAndStream: Story = {
  args: {
    hasFile: true,
    playDisabled: false,
    onStream: () => {}
  }
}

export const WithoutFileAndStream: Story = {
  args: {
    hasFile: false,
    playDisabled: false,
    onStream: () => {}
  }
}

export const PlayDisabled: Story = {
  args: {
    hasFile: true,
    playDisabled: true
  }
}
