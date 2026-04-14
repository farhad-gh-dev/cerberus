import type { Meta, StoryObj } from '@storybook/react-vite'
import Dropdown from './dropdown'
import { ArrowUpDown } from 'lucide-react'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  argTypes: {
    onChange: { action: 'changed' }
  }
}

export default meta
type Story = StoryObj<typeof Dropdown<string>>

const choices = [
  { value: 'title-asc', label: 'Title A → Z' },
  { value: 'title-desc', label: 'Title Z → A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'year-desc', label: 'Newest' }
]

export const Default: Story = {
  args: {
    value: 'title-asc',
    choices,
    icon: <ArrowUpDown size={14} className="text-zinc-400" />
  }
}

export const WithDifferentSelection: Story = {
  args: {
    value: 'rating-desc',
    choices,
    icon: <ArrowUpDown size={14} className="text-zinc-400" />
  }
}
