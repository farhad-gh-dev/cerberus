import type { Meta, StoryObj } from '@storybook/react-vite'
import type { LibraryMovie } from '@shared/types'
import LibrarySidePanel from './library-side-panel'

const meta: Meta<typeof LibrarySidePanel> = {
  title: 'Components/Library/LibrarySidePanel',
  component: LibrarySidePanel,
  decorators: [
    (Story) => (
      <div style={{ width: 320, padding: 16 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof LibrarySidePanel>

const movie: LibraryMovie = {
  id: 1,
  imdbId: 'tt1375666',
  title: 'Inception',
  year: '2010',
  posterUrl: '',
  plot: 'A thief who steals corporate secrets.',
  genre: 'Action, Sci-Fi',
  director: 'Christopher Nolan',
  actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe',
  imdbRating: '8.8',
  runtime: '148 min',
  filePath: 'C:\\Movies\\Inception.mkv',
  addedAt: '2024-01-15T10:00:00Z',
  language: 'English'
}

export const Default: Story = {
  args: { movie }
}

export const MinimalInfo: Story = {
  args: {
    movie: {
      ...movie,
      director: 'N/A',
      actors: 'N/A'
    }
  }
}
