import type { Meta, StoryObj } from '@storybook/react-vite'
import type { MovieDetail } from '@shared/types'
import MovieSidePanel from './movie-side-panel'

const meta: Meta<typeof MovieSidePanel> = {
  title: 'Components/MovieSidePanel',
  component: MovieSidePanel,
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 16 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof MovieSidePanel>

const movie: MovieDetail = {
  tmdbId: 27205,
  imdbId: 'tt1375666',
  title: 'Inception',
  year: '2010',
  rated: 'PG-13',
  runtime: '148 min',
  genre: 'Action, Sci-Fi, Thriller',
  director: 'Christopher Nolan',
  writer: 'Christopher Nolan',
  actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe',
  plot: 'A thief who steals corporate secrets.',
  posterUrl: '',
  backdropUrl: '',
  rating: '8.8',
  votes: '2,300,000',
  boxOffice: '$292,576,195',
  language: 'English'
}

export const Default: Story = {
  args: {
    movie,
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Ken Watanabe'],
    directors: ['Christopher Nolan'],
    writers: ['Christopher Nolan']
  }
}

export const MinimalInfo: Story = {
  args: {
    movie: {
      ...movie,
      rating: 'N/A',
      votes: 'N/A',
      boxOffice: 'N/A'
    },
    cast: [],
    directors: [],
    writers: []
  }
}

export const MultipleDirectors: Story = {
  args: {
    movie: {
      ...movie,
      boxOffice: 'N/A'
    },
    cast: ['Actor One', 'Actor Two'],
    directors: ['Director One', 'Director Two'],
    writers: ['Writer One', 'Writer Two', 'Writer Three']
  }
}
