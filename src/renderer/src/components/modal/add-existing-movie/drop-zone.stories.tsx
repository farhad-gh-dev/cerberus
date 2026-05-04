import type { Meta, StoryObj } from '@storybook/react-vite'
import DropZone from './drop-zone'

const meta: Meta<typeof DropZone> = {
  title: 'Components/Modal/AddExistingMovie/DropZone',
  component: DropZone,
  argTypes: {
    onPickFiles: { action: 'pickFiles' },
    onPickFolder: { action: 'pickFolder' }
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-4" style={{ width: 520 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof DropZone>

export const Default: Story = {
  args: {}
}

export const CustomFormats: Story = {
  args: {
    supportedFormats: 'Supported Formats: MP4, MKV, MOV, M4V'
  }
}
