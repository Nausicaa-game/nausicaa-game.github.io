const SWEAR_URLS = [
  '/js/swearList/fr.json',
  '/js/swearList/en.json',
  '/js/swearList/de.json',
  '/js/swearList/es.json',
  '/js/swearList/it.json',
  '/js/swearList/pt.json',
  '/js/swearList/ru.json',
  '/js/swearList/nl.json',
]

let swearsPromise: Promise<string[]> | null = null

function loadSwears(): Promise<string[]> {
  if (swearsPromise) return swearsPromise
  swearsPromise = (async () => {
    const results = await Promise.allSettled(
      SWEAR_URLS.map(url => fetch(url).then(r => r.json() as Promise<string[]>)),
    )
    const all: string[] = []
    for (const r of results) {
      if (r.status === 'fulfilled') all.push(...r.value)
    }
    return [...new Set(all.map(s => s.toLowerCase()))]
  })()
  return swearsPromise
}

let swearsCache: string[] | null = null

export async function ensureSwearsLoaded(): Promise<void> {
  if (!swearsCache) swearsCache = await loadSwears()
}

export function filterProfanity(text: string): string {
  if (!swearsCache) return text
  let filtered = text
  for (const word of swearsCache) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(escaped, 'gi')
    filtered = filtered.replace(re, m => '*'.repeat(m.length))
  }
  return filtered
}
