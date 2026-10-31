export type AppMode = 'home' | 'evaluate' | 'discover' | 'compare' | 'settings'

const paths = {
  evaluate: <><path d="m16 3 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15Z" /><path d="m3 15 5 5" /></>,
  discover: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6Z" /></>,
  compare: <><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" /></>,
  home: <path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />,
  settings: <><path d="m9 3-.6 2.4-2 .9L4.2 6 2 10l1.8 1.6v1L2 14l2.2 4 2.2-.3 2 .9L9 21h6l.6-2.4 2-.9 2.2.3 2.2-4-1.8-1.4v-1L22 10l-2.2-4-2.2.3-2-.9L15 3Z" /><circle cx="12" cy="12" r="3" /></>,
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
    <div className="app-wordmark" aria-label="Ideen Scout">Ideen<br />{' '}Scout<span aria-hidden="true">.</span></div>
    <nav className="primary-navigation" aria-label="Hauptwege">
      {item('evaluate', 'Idee prüfen')}
      {item('discover', 'Ideen finden')}
      {item('compare', 'Ideen vergleichen')}
    </nav>
    <nav className="collection-navigation" aria-label="Gespeicherte Ideen">{item('home', 'Sammlung')}</nav>
  </aside>
}
