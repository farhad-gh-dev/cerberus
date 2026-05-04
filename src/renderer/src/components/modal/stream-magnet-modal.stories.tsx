import type { Meta, StoryObj } from '@storybook/react-vite'
import StreamMagnetModal from './stream-magnet-modal'

const meta: Meta<typeof StreamMagnetModal> = {
  title: 'Components/Modal/StreamMagnetModal',
  component: StreamMagnetModal,
  argTypes: {
    onClose: { action: 'close' },
    onSubmit: { action: 'submit' }
  }
}

export default meta
type Story = StoryObj<typeof StreamMagnetModal>

export const Open: Story = {
  args: {
    open: true,
    onSubmit: async () => {}
  }
}

export const Closed: Story = {
  args: {
    open: false,
    onSubmit: async () => {}
  }
}
