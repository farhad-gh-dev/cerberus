import type { Meta, StoryObj } from '@storybook/react-vite'
import ErrorBoundary from './error-boundary'

function ThrowingComponent() {
  throw new Error('Something went wrong in a child component')
}

function WorkingComponent() {
  return <p className="text-white p-4">Everything is fine here.</p>
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary
}

export default meta
type Story = StoryObj<typeof ErrorBoundary>

export const WithError: Story = {
  args: {
    children: <ThrowingComponent />
  }
}

export const NoError: Story = {
  args: {
    children: <WorkingComponent />
  }
}
