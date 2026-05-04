import type { Meta, StoryObj } from '@storybook/react-vite'
import type { MovieSearchItem } from '@shared/types'
import SelectedMovie from './selected-movie'

const baseMovie: MovieSearchItem = {
  id: 27205,
  title: 'Inception',
  year: '2010',
  posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  rating: '8.8',
  genres: ['Action', 'Sci-Fi', 'Thriller'],
  language: 'English'
}

const meta: Meta<typeof SelectedMovie> = {
  title: 'Components/Modal/AddExistingMovie/SelectedMovie',
  component: SelectedMovie,
  argTypes: {
    onChange: { action: 'change' }
  },
  decorators: [
    (Story) => (
      <div className="bg-black p-4" style={{ width: 560 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof SelectedMovie>

export const Default: Story = {
  args: {
    movie: baseMovie
  }
}

export const WithoutPoster: Story = {
  args: {
    movie: {
      ...baseMovie,
      posterUrl: '',
      title: 'Unknown Movie',
      rating: '',
      genres: [],
      language: ''
    }
  }
}
