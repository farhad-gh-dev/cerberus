import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountryStats } from './country-stats'

const meta: Meta<typeof CountryStats> = {
  title: 'Components/CountryStats',
  component: CountryStats
}

export default meta
type Story = StoryObj<typeof CountryStats>

export const Default: Story = {
  args: {
    countries: [
      ['United States', 12],
      ['Germany', 8],
      ['Japan', 5],
      ['Brazil', 3]
    ]
  }
}

export const SingleCountry: Story = {
  args: {
    countries: [['France', 42]]
  }
}

export const Empty: Story = {
  args: {
    countries: []
  }
}

export const ManyCountries: Story = {
  args: {
    countries: [
      ['US', 25],
      ['DE', 18],
      ['JP', 12],
      ['BR', 9],
      ['GB', 7],
      ['FR', 5],
      ['AU', 3],
      ['KR', 2]
    ]
  }
}
