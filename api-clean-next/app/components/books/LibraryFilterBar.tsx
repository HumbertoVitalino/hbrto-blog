'use client'

import { forwardRef } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FacetOption } from './libraryFilters'

interface LibraryFilterBarProps {
    query: string
    onQueryChange: (value: string) => void
    year: string
    yearOptions: FacetOption[]
    onYearChange: (value: string) => void
    author: string
    authorOptions: FacetOption[]
    onAuthorChange: (value: string) => void
    genre: string
    genreOptions: FacetOption[]
    onGenreChange: (value: string) => void
    canClear: boolean
    onClear: () => void
}

export const LibraryFilterBar = forwardRef<HTMLDivElement, LibraryFilterBarProps>(function LibraryFilterBar({
    query,
    onQueryChange,
    year,
    yearOptions,
    onYearChange,
    author,
    authorOptions,
    onAuthorChange,
    genre,
    genreOptions,
    onGenreChange,
    canClear,
    onClear,
}, ref) {
    return (
        <div ref={ref} className="flex scroll-mt-20 flex-col gap-2 sm:flex-row sm:items-center">

            {/* SEARCH */}
            <div className="relative sm:w-64 sm:shrink-0">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search title or author"
                    aria-label="Search by title or author"
                    className="h-9 rounded-full pl-9 md:h-8"
                />
            </div>

            {/* FACETS — native selects, so phones get the OS picker */}
            <div className="relative min-w-0 flex-1">
                <div
                    className="flex items-center gap-1.5 overflow-x-auto pr-8"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {yearOptions.length > 0 && (
                        <FilterPill
                            label="Year"
                            allLabel="All years"
                            value={year}
                            options={yearOptions}
                            onChange={onYearChange}
                        />
                    )}
                    {authorOptions.length > 1 && (
                        <FilterPill
                            label="Author"
                            allLabel="All authors"
                            value={author}
                            options={authorOptions}
                            onChange={onAuthorChange}
                        />
                    )}
                    {genreOptions.length > 1 && (
                        <FilterPill
                            label="Genre"
                            allLabel="All genres"
                            value={genre}
                            options={genreOptions}
                            onChange={onGenreChange}
                        />
                    )}
                    {canClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:h-8"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>
                <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-linear-to-l from-background to-transparent" />
            </div>
        </div>
    )
})

interface FilterPillProps {
    label: string
    allLabel: string
    value: string
    options: FacetOption[]
    onChange: (value: string) => void
}

function FilterPill({ label, allLabel, value, options, onChange }: FilterPillProps) {
    const active = value !== 'all'
    const selected = options.find(option => option.value === value)

    return (
        <label
            className={`relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full border pr-2 pl-3 text-xs font-medium transition-colors has-[select:focus-visible]:ring-3 has-[select:focus-visible]:ring-ring/50 md:h-8 ${
                active
                    ? 'border-primary/40 bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            }`}
        >
            <span className="max-w-40 truncate">{active && selected ? selected.label : label}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
            {/* invisible but on top: the pill is the face, the select is the control. text-base stops iOS zooming */}
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none opacity-0 text-base"
            >
                <option value="all">{allLabel}</option>
                {options.map(option => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.count === 0 && option.value !== value}
                    >
                        {option.label} ({option.count})
                    </option>
                ))}
            </select>
        </label>
    )
}
