/**
 * Format date to American format: MM/DD/YYYY HH:MM
 * Example: 03/29/2026 14:30
 */
export function formatDate(date: Date | undefined): string {
  if (!date) return ""

  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${month}/${day}/${year} ${hours}:${minutes}`
}
