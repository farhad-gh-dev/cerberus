import type { Meta, StoryObj } from '@storybook/react-vite'
import MovieDetailLayout from './movie-detail-layout'
import { ArrowLeft, Star, Clock } from 'lucide-react'

const meta: Meta<typeof MovieDetailLayout> = {
  title: 'Components/MovieDetailLayout',
  component: MovieDetailLayout,
  decorators: [
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof MovieDetailLayout>

export const WithBackdrop: Story = {
  args: {
    heroImage: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    backdropLoading: false,
    navButton: (
      <button className="absolute top-12 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
        <ArrowLeft size={20} />
      </button>
    ),
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    title: 'Inception',
    meta: (
      <>
        <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
          <Star size={16} fill="currentColor" />
          8.8
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          148 min
        </span>
        <span>2010</span>
      </>
    ),
    plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    actions: (
      <button className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl">
        Play
      </button>
    ),
    sidePanel: (
      <div className="text-white/70 text-sm">
        <p>Director: Christopher Nolan</p>
        <p className="mt-2">Cast: Leonardo DiCaprio, Joseph Gordon-Levitt</p>
      </div>
    )
  }
}

export const NoBackdrop: Story = {
  args: {
    heroImage: null,
    backdropLoading: false,
    navButton: (
      <button className="absolute top-12 left-6 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white">
        <ArrowLeft size={20} />
      </button>
    ),
    genres: ['Drama'],
    title: 'Unknown Movie',
    meta: <span>2024</span>,
    plot: 'No plot available.',
    actions: <button className="bg-white/10 text-white px-7 py-3 rounded-xl">Find Torrents</button>,
    sidePanel: <div />
  }
}

export const BackdropLoading: Story = {
  args: {
    heroImage: null,
    backdropLoading: true,
    navButton: null,
    genres: [],
    title: 'Loading...',
    meta: null,
    actions: null,
    sidePanel: <div />
  }
}
