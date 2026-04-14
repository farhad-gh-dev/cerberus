import type { Meta, StoryObj } from '@storybook/react-vite'
import SpeedChart from './SpeedChart'

const meta: Meta<typeof SpeedChart> = {
  title: 'Components/SpeedChart',
  component: SpeedChart,
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 300 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof SpeedChart>

export const Default: Story = {
  args: {
    downloadSpeed: 2.5 * 1024 * 1024,
    uploadSpeed: 512 * 1024,
    maxPoints: 60
  }
}

export const HighSpeed: Story = {
  args: {
    downloadSpeed: 10 * 1024 * 1024,
    uploadSpeed: 2 * 1024 * 1024,
    maxPoints: 60
  }
}

export const Idle: Story = {
  args: {
    downloadSpeed: 0,
    uploadSpeed: 0,
    maxPoints: 60
  }
}
