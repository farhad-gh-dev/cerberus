import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieGrid from './movie-grid'
import MovieCard from './movie-card'

const meta: Meta<typeof MovieGrid> = {
  title: 'Components/MovieGrid',
  component: MovieGrid
}

export default meta
type Story = StoryObj<typeof MovieGrid>

const movies = [
  {
    title: 'Inception',
    year: '2010',
    posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    rating: '8.8'
  },
  {
    title: 'The Dark Knight',
    year: '2008',
    posterUrl: 'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg',
    rating: '9.0'
  },
  {
    title: 'Interstellar',
    year: '2014',
    posterUrl: 'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: '8.7'
  },
  {
    title: 'Memento',
    year: '2000',
    posterUrl: 'https://image.tmdb.org/t/p/w300/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg',
    rating: '8.4'
  },
  {
    title: 'The Prestige',
    year: '2006',
    posterUrl: 'https://image.tmdb.org/t/p/w300/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg',
    rating: '8.5'
  },
  { title: 'Dunkirk', year: '2017', posterUrl: '', rating: '7.8' }
]

export const Default: Story = {
  args: {
    children: movies.map((m) => <MovieCard key={m.title} {...m} />)
  }
}

export const SingleItem: Story = {
  args: {
    children: (
      <MovieCard
        title="Inception"
        year="2010"
        posterUrl="https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
        rating="8.8"
      />
    )
  }
}
