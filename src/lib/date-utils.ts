export function formatDate(date: string | Date, format: 'long' | 'short' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
