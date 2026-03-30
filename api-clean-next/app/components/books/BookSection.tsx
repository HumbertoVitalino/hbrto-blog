import { ReactNode } from 'react'

interface BookSectionProps {
  title: string
  description: string
  count: number
  statusColor: string
  children: ReactNode
}

export function BookSection({
  title,
  description,
  count,
  statusColor,
  children,
}: BookSectionProps) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="border-l-4 pl-4" style={{ borderColor: statusColor }}>
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full`} style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
            {count}
          </span>
        </div>
      </div>

      {/* Books Grid */}
      <div>{children}</div>
    </section>
  )
}
