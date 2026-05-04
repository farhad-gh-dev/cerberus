import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieCard from './movie-card'

const meta: Meta<typeof MovieCard> = {
  title: 'Components/MovieCard',
  component: MovieCard,
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    onClick: { action: 'clicked' }
  }
}

export default meta
type Story = StoryObj<typeof MovieCard>

export const Default: Story = {
  args: {
    title: 'Inception',
    year: '2010',
    posterUrl:
      'https://filmartgallery.com/cdn/shop/files/Avengers-Endgame-Official-Movie-Poster-Vintage-Movie-Poster-Original_58df4ad7_5000x.jpg?v=1771962611',
    rating: '8.8',
    genres: ['Sci-Fi', 'Action'],
    language: 'EN',
    runtime: '148 min'
  }
}

export const InLibrary: Story = {
  args: {
    title: 'The Dark Knight',
    year: '2008',
    posterUrl:
      'https://filmartgallery.com/cdn/shop/files/Avengers-Endgame-Official-Movie-Poster-Vintage-Movie-Poster-Original_58df4ad7_5000x.jpg?v=1771962611',
    rating: '9.0',
    genres: ['Action', 'Crime'],
    language: 'EN',
    runtime: '152 min',
    isInLibrary: true
  }
}

export const Downloaded: Story = {
  args: {
    title: 'Interstellar',
    year: '2014',
    posterUrl: 'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: '8.7',
    genres: ['Sci-Fi', 'Drama'],
    language: 'EN',
    runtime: '169 min',
    isInLibrary: true,
    isDownloaded: true
  }
}

export const NoPoster: Story = {
  args: {
    title: 'Unknown Movie',
    year: '2024',
    posterUrl: '',
    rating: '7.2'
  }
}

export const NoRating: Story = {
  args: {
    title: 'Memento',
    year: '2000',
    posterUrl: 'https://image.tmdb.org/t/p/w300/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg'
  }
}

export const DownloadedOnly: Story = {
  args: {
    title: 'The Prestige',
    year: '2006',
    posterUrl: 'https://image.tmdb.org/t/p/w300/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg',
    rating: '8.5',
    isDownloaded: true
  }
}
