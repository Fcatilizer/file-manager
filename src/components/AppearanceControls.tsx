import { Icon } from './Icon'

type Props = {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function AppearanceControls({ theme, onToggleTheme }: Props) {
  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
      </button>
    </>
  )
}
