import type { Meta, StoryObj } from '@storybook/react-vite'
import Heading from './heading'

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading
}

export default meta
type Story = StoryObj<typeof Heading>

export const H1: Story = {
  args: { level: 1, children: 'Heading Level 1' }
}

export const H2: Story = {
  args: { level: 2, children: 'Heading Level 2' }
}

export const H3: Story = {
  args: { level: 3, children: 'Heading Level 3' }
}

export const H4: Story = {
  args: { level: 4, children: 'Heading Level 4' }
}
