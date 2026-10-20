'use client'

import { BookStatus } from '@/domain/BookStatus'
import { Segmented } from '@/app/components/layout/Segmented'
import { StatusFilter } from './libraryFilters'

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: BookStatus.InProgress, label: 'Reading' },
  { value: BookStatus.NotStarted, label: 'To read' },
  { value: BookStatus.Completed, label: 'Completed' },
]

export function StatusSegmented({ value, counts, onChange }: {
  value: StatusFilter
  counts: Record<StatusFilter, number>
  onChange: (value: StatusFilter) => void
}) {
  return (
    <Segmented
      id="library-status"
      label="Filter by status"
      options={OPTIONS.map(o => ({ ...o, count: counts[o.value] }))}
      value={value}
      onChange={onChange}
    />
  )
}
