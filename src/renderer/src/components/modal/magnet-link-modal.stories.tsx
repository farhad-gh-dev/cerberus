import type { Meta, StoryObj } from '@storybook/react-vite'
import MagnetLinkModal from './magnet-link-modal'

const meta: Meta<typeof MagnetLinkModal> = {
  title: 'Components/MagnetLinkModal',
  component: MagnetLinkModal,
  argTypes: {
    onClose: { action: 'close' },
    onSubmit: { action: 'submit' }
  }
}

export default meta
type Story = StoryObj<typeof MagnetLinkModal>

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
