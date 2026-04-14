import type { Meta, StoryObj } from '@storybook/react-vite'
import type { LibraryMovie } from '@shared/types'
import LibraryMeta from './library-meta'

const meta: Meta<typeof LibraryMeta> = {
  title: 'Components/LibraryMeta',
  component: LibraryMeta,
  decorators: [
    (Story) => (
      <div className="flex items-center gap-4 text-sm text-white/70">
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof LibraryMeta>

const fullMovie: LibraryMovie = {
  id: 1,
  imdbId: 'tt1375666',
  title: 'Inception',
  year: '2010',
  posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  plot: 'A thief who steals corporate secrets.',
  genre: 'Action, Sci-Fi, Thriller',
  director: 'Christopher Nolan',
  actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
  imdbRating: '8.8',
  runtime: '148 min',
  filePath: 'C:\\Movies\\Inception.mkv',
  addedAt: '2024-01-15T10:00:00Z'
}

export const Default: Story = {
  args: { movie: fullMovie }
}

export const MinimalInfo: Story = {
  args: {
    movie: {
      ...fullMovie,
      imdbRating: 'N/A',
      runtime: 'N/A'
    }
  }
}
