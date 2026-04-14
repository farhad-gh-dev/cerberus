import type { Meta, StoryObj } from '@storybook/react-vite'
import LibraryFooter from './library-footer'

const meta: Meta<typeof LibraryFooter> = {
  title: 'Components/LibraryFooter',
  component: LibraryFooter,
  argTypes: {
    onPickVideo: { action: 'pickVideo' }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof LibraryFooter>

export const WithFile: Story = {
  args: {
    hasFile: true,
    resolvedVideo: 'C:\\Movies\\Inception.2010.1080p.BluRay.mkv',
    filePath: 'C:\\Movies\\Inception.2010.1080p.BluRay.mkv'
  }
}

export const WithResolvedVideo: Story = {
  args: {
    hasFile: true,
    resolvedVideo: 'C:\\Movies\\Inception\\Inception.mkv',
    filePath: 'C:\\Movies\\Inception'
  }
}

export const NoFile: Story = {
  args: {
    hasFile: false,
    resolvedVideo: null
  }
}
