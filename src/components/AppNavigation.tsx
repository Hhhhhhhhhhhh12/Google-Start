export type AppMode = 'home' | 'evaluate' | 'discover' | 'compare' | 'settings'

const paths = {
  evaluate: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  discover: <><path d="M9 18h6M10 21h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z" /></>,
  compare: <><rect x="3" y="4" width="7" height="16" rx="1" /><rect x="14" y="4" width="7" height="16" rx="1" /></>,
  home: <path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />,
  settings: <><path d="M3 6h6m4 0h8M3 12h12m4 0h2M3 18h2m4 0h12" /><circle cx="11" cy="6" r="2" /><circle cx="17" cy="12" r="2" /><circle cx="7" cy="18" r="2" /></>,
}

export function NavigationIcon({ name }: { name: AppMode }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

type Props = { mode: AppMode; count: number; onNavigate: (mode: AppMode) => void }

export function AppNavigation({ mode, count, onNavigate }: Props) {
  function item(value: AppMode, label: string) {
    return <button type="button" className="navigation-item" aria-current={mode === value ? 'page' : undefined} onClick={() => onNavigate(value)}>
      <NavigationIcon name={value} /><span>{label}</span>{value === 'home' && <span className="collection-count">{count}</span>}
    </button>
  }
  return <aside className="app-sidebar" aria-label="Seitenleiste">
    <nav className="primary-navigation" aria-label="Hauptwege">
      {item('evaluate', 'Idee prüfen')}
      {item('discover', 'Ideen finden')}
      {item('compare', 'Ideen vergleichen')}
    </nav>
    <nav className="collection-navigation" aria-label="Gespeicherte Ideen">{item('home', 'Sammlung')}</nav>
    <nav className="settings-navigation" aria-label="Konfiguration">{item('settings', 'Einstellungen')}</nav>
  </aside>
}
