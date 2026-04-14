import type { Meta, StoryObj } from '@storybook/react-vite'
import ConfirmRemoveModal from './confirm-remove-modal'

const meta: Meta<typeof ConfirmRemoveModal> = {
  title: 'Components/ConfirmRemoveModal',
  component: ConfirmRemoveModal,
  argTypes: {
    onConfirm: { action: 'confirm' },
    onCancel: { action: 'cancel' }
  }
}

export default meta
type Story = StoryObj<typeof ConfirmRemoveModal>

export const Default: Story = {
  args: {
    movieTitle: 'Inception',
    filePath: 'C:\\Movies\\Inception.2010.1080p.mkv'
  }
}

export const WithoutFilePath: Story = {
  args: {
    movieTitle: 'The Dark Knight'
  }
}
