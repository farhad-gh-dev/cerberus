import type { Meta, StoryObj } from '@storybook/react-vite'
import FileRow from './file-row'

const meta: Meta<typeof FileRow> = {
  title: 'Components/Modal/AddExistingMovie/FileRow',
  component: FileRow,
  argTypes: {
    onClear: { action: 'clear' }
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-4" style={{ width: 520 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof FileRow>

export const Default: Story = {
  args: {
    filePath: 'C:\\Movies\\Everything.Everywhere.All.At.Once.2022.2160p.mkv'
  }
}

export const AviFile: Story = {
  args: {
    filePath: 'D:\\Media\\The.Matrix.1999.avi'
  }
}
