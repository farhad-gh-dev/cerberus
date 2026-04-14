import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import ApiKeyWarning from './api-key-warning'

const meta: Meta<typeof ApiKeyWarning> = {
  title: 'Components/ApiKeyWarning',
  component: ApiKeyWarning,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ maxWidth: 600 }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ]
}

export default meta
type Story = StoryObj<typeof ApiKeyWarning>

export const Default: Story = {}
