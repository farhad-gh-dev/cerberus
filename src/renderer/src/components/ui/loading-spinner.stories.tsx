import type { Meta, StoryObj } from '@storybook/react-vite'
import PageLoader from './loading-spinner'

const meta: Meta<typeof PageLoader> = {
  title: 'Components/PageLoader',
  component: PageLoader
}

export default meta
type Story = StoryObj<typeof PageLoader>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 16 }
}

export const Large: Story = {
  args: { size: 64 }
}
