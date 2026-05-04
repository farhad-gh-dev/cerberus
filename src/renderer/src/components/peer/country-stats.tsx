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
          className="rounded-lg border border-custom-200 bg-custom-50/60 px-3 py-1.5 text-[10px] whitespace-nowrap dark:border-custom-700/60 dark:bg-custom-800/60"
        >
          <span className="font-medium text-custom-700 dark:text-custom-200">{country}</span>
          <span className="ml-1.5 text-custom-500 dark:text-custom-500">{count}</span>
        </div>
      ))}
    </div>
  )
})
