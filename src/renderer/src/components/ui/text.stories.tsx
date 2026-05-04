import type { Meta, StoryObj } from '@storybook/react-vite'
import Text from './text'

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text
}

export default meta
type Story = StoryObj<typeof Text>

export const Default: Story = {
  args: { children: 'Default body text in base size.' }
}

export const Small: Story = {
  args: { size: 'sm', children: 'Small text for captions and labels.' }
}

export const ExtraSmall: Story = {
  args: { size: 'xs', children: 'Extra small text for fine print.' }
}

export const Large: Story = {
  args: { size: 'lg', children: 'Large text for emphasis.' }
}

export const Muted: Story = {
  args: { variant: 'muted', children: 'Muted secondary text.' }
}

export const Accent: Story = {
  args: { variant: 'accent', children: 'Accent text for links or highlights.' }
}

export const AsSpan: Story = {
  args: { as: 'span', children: 'Rendered as a <span> element.' }
}
