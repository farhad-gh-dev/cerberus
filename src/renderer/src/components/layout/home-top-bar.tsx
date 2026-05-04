import { TrendingUp, Flame, Star } from 'lucide-react'
import Heading from '../ui/heading'
import SearchBar from '../ui/search-bar'
import CategoryTab from '../ui/category-tab'
import type { MovieCategory } from '../../hooks/use-home'

interface HomeTopBarProps {
  category: MovieCategory
  isSearching: boolean
  onCategoryChange: (category: MovieCategory) => void
  onSearch: (query: string) => void
  onReset: () => void
}

const TABS: { key: MovieCategory; label: string; icon: typeof TrendingUp }[] = [
  { key: 'trending', label: 'Trending', icon: TrendingUp },
  { key: 'popular', label: 'Popular', icon: Flame },
  { key: 'top-rated', label: 'Top Rated', icon: Star }
]

export default function HomeTopBar({
  category,
  isSearching,
  onCategoryChange,
  onSearch,
  onReset
}: HomeTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left — Page title */}
      <Heading level={1} className="shrink-0 !font-semibold">
        {isSearching ? 'Search results' : 'Discover'}
      </Heading>

      {/* Center — Category tabs (hidden during search) */}
      {!isSearching && (
        <div className="flex items-center gap-6">
          {TABS.map((tab) => (
            <CategoryTab
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              isActive={tab.key === category}
              onClick={() => onCategoryChange(tab.key)}
            />
          ))}
        </div>
      )}

      {/* Right — Search bar */}
      <div className="shrink-0">
        <SearchBar onSearch={onSearch} onReset={onReset} />
      </div>
    </div>
  )
}
