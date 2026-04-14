import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieActions from './movie-actions'

const meta: Meta<typeof MovieActions> = {
  title: 'Components/MovieActions',
  component: MovieActions,
  argTypes: {
    onPlay: { action: 'play' },
    onFindTorrents: { action: 'findTorrents' },
    onAddToLibrary: { action: 'addToLibrary' },
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
type Story = StoryObj<typeof MovieActions>

export const NotInLibrary: Story = {
  args: {
    hasFile: false,
    inLibrary: false,
    addingToLibrary: false,
    playDisabled: false
  }
}

export const InLibraryWithFile: Story = {
  args: {
    hasFile: true,
    inLibrary: true,
    addingToLibrary: false,
    playDisabled: false
  }
}

export const InLibraryNoFile: Story = {
  args: {
    hasFile: false,
    inLibrary: true,
    addingToLibrary: false,
    playDisabled: false
  }
}

export const AddingToLibrary: Story = {
  args: {
    hasFile: false,
    inLibrary: false,
    addingToLibrary: true,
    playDisabled: false
  }
}

export const WithStream: Story = {
  args: {
    hasFile: false,
    inLibrary: false,
    addingToLibrary: false,
    playDisabled: false,
    onStream: () => {}
  }
}
