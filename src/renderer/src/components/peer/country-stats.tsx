import { memo } from 'react'

interface CountryStatsProps {
  countries: [country: string, count: number][]
}

export const CountryStats = memo(function CountryStats({ countries }: CountryStatsProps) {
  if (countries.length === 0) return null

  return (
    <div className="flex items-center gap-3 flex-1 overflow-hidden">
      {countries.map(([country, count]) => (
        <div
          key={country}
          className="bg-zinc-900/60 border border-zinc-800/40 rounded-lg px-3 py-1.5 text-[10px] whitespace-nowrap"
        >
          <span className="text-zinc-400 font-medium">{country}</span>
          <span className="text-zinc-600 ml-1.5">{count}</span>
        </div>
      ))}
    </div>
  )
})
