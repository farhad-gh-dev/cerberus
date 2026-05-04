import type { Meta, StoryObj } from '@storybook/react-vite'
import { DownloadProgressRing } from './download-progress-ring'

const meta: Meta<typeof DownloadProgressRing> = {
  title: 'Components/Download/DownloadProgressRing',
  component: DownloadProgressRing,
  decorators: [
    (Story) => (
      <div style={{ width: 220, height: 220 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof DownloadProgressRing>

export const Default: Story = {
  args: {
    downloaded: 450 * 1024 * 1024,
    totalSize: 1024 * 1024 * 1024,
    progress: 0.45
  }
}

export const Empty: Story = {
  args: {
    downloaded: 0,
    totalSize: 2 * 1024 * 1024 * 1024,
    progress: 0
  }
}

export const HalfDone: Story = {
  args: {
    downloaded: 512 * 1024 * 1024,
    totalSize: 1024 * 1024 * 1024,
    progress: 0.5
  }
}

export const AlmostComplete: Story = {
  args: {
    downloaded: 950 * 1024 * 1024,
    totalSize: 1024 * 1024 * 1024,
    progress: 0.95
  }
}

export const Complete: Story = {
  args: {
    downloaded: 1024 * 1024 * 1024,
    totalSize: 1024 * 1024 * 1024,
    progress: 1
  }
}
