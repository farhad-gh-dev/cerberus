import type { Meta, StoryObj } from '@storybook/react-vite'
import type { MovieDetail } from '@shared/types'
import MovieMeta from './movie-meta'

const meta: Meta<typeof MovieMeta> = {
  title: 'Components/MovieMeta',
  component: MovieMeta,
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 text-sm text-white/70">
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof MovieMeta>

const fullMovie: MovieDetail = {
  tmdbId: 27205,
  imdbId: 'tt1375666',
  title: 'Inception',
  year: '2010',
  rated: 'PG-13',
  runtime: '148 min',
  genre: 'Action, Sci-Fi, Thriller',
  director: 'Christopher Nolan',
  writer: 'Christopher Nolan',
  actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page',
  plot: 'A thief who steals corporate secrets through dream-sharing technology.',
  posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  backdropUrl: '',
  rating: '8.8',
  votes: '2,300,000',
  boxOffice: '$292,576,195',
  language: 'English'
}

export const Default: Story = {
  args: { movie: fullMovie }
}

export const MinimalInfo: Story = {
  args: {
    movie: {
      ...fullMovie,
      rating: 'N/A',
      votes: 'N/A',
      runtime: 'N/A',
      rated: 'N/A',
      year: '2010'
    }
  }
}

export const NoRating: Story = {
  args: {
    movie: {
      ...fullMovie,
      rating: 'N/A',
      votes: 'N/A'
    }
  }
}
