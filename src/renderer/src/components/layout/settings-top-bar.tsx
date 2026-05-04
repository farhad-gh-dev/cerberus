import Heading from '../ui/heading'

export default function SettingsTopBar() {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left — Page title */}
      <Heading level={1} className="!font-semibold">
        Settings
      </Heading>
    </div>
  )
}
