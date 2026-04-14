import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieSearchResultItem from './movie-search-result-item'

const meta: Meta<typeof MovieSearchResultItem> = {
  title: 'Components/MovieSearchResultItem',
  component: MovieSearchResultItem,
  argTypes: {
    onAdd: { action: 'add' }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof MovieSearchResultItem>

export const Default: Story = {
  args: {
    item: {
      id: 27205,
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'
    },
    isAdding: false,
    disabled: false
  }
}

export const Adding: Story = {
  args: {
    item: {
      id: 27205,
      title: 'Inception',
      year: '2010',
      posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'
    },
    isAdding: true,
    disabled: true
  }
}

export const Disabled: Story = {
  args: {
    item: {
      id: 155,
      title: 'The Dark Knight',
      year: '2008',
      posterUrl: 'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg'
    },
    isAdding: false,
    disabled: true
  }
}

export const NoPoster: Story = {
  args: {
    item: {
      id: 999,
      title: 'Unknown Movie',
      year: '2024',
      posterUrl: ''
    },
    isAdding: false,
    disabled: false
  }
}
