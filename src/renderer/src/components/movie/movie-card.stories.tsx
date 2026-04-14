import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieCard from './movie-card'

const meta: Meta<typeof MovieCard> = {
  title: 'Components/MovieCard',
  component: MovieCard,
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['none', 'in-library', 'downloaded']
    },
    onClick: { action: 'clicked' }
  }
}

export default meta
type Story = StoryObj<typeof MovieCard>

export const Default: Story = {
  args: {
    title: 'Inception',
    year: '2010',
    posterUrl: 'https://image.tmdb.org/t/p/w300/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    rating: '8.8'
  }
}

export const InLibrary: Story = {
  args: {
    title: 'The Dark Knight',
    year: '2008',
    posterUrl: 'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911BTUgMe1nNaD3.jpg',
    rating: '9.0',
    status: 'in-library'
  }
}

export const Downloaded: Story = {
  args: {
    title: 'Interstellar',
    year: '2014',
    posterUrl: 'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: '8.7',
    status: 'downloaded'
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

export const HiddenBadge: Story = {
  args: {
    title: 'The Prestige',
    year: '2006',
    posterUrl: 'https://image.tmdb.org/t/p/w300/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg',
    rating: '8.5',
    status: 'downloaded',
    hideStatusBadge: true
  }
}
