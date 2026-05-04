import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieSearchResultItem from './movie-search-result-item'

const meta: Meta<typeof MovieSearchResultItem> = {
  title: 'Components/MovieSearchResultItem',
  component: MovieSearchResultItem,
  argTypes: {
    onSelect: { action: 'select' }
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
      posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      rating: '8.8',
      genres: ['Action', 'Sci-Fi'],
      language: 'English'
    }
  }
}

export const NoPoster: Story = {
  args: {
    item: {
      id: 155,
      title: 'The Dark Knight',
      year: '2008',
      posterUrl: '',
      rating: '9.0',
      genres: ['Action', 'Crime'],
      language: 'English'
    }
  }
}

export const UnknownMovie: Story = {
  args: {
    item: {
      id: 999,
      title: 'Unknown Movie',
      year: '2024',
      posterUrl: '',
      rating: '',
      genres: [],
      language: ''
    }
  }
}
