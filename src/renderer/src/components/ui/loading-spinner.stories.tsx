import type { Meta, StoryObj } from '@storybook/react-vite'
import LoadingSpinner from './loading-spinner'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner
}

export default meta
type Story = StoryObj<typeof LoadingSpinner>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 16 }
}

export const Large: Story = {
  args: { size: 64 }
}
