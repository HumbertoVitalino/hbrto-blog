'use client'

import { forwardRef } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { FacetOption } from './libraryFilters'
import { cn } from '@/lib/utils'

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
        <div ref={ref} className="flex scroll-mt-28 flex-wrap items-center gap-2">

            {/* SEARCH — a filled field, the way a system search field looks */}
            <label className="relative min-w-0 flex-[1_1_14rem] lg:flex-[0_1_15rem]">
                <span className="sr-only">Search by title or author</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Search title or author"
                    className="w-full rounded-full bg-muted py-1.5 pl-8 pr-3 text-base leading-6 placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-brand-accent/25 sm:text-sm"
                />
            </label>

            {/* FACETS — native selects, so phones get the OS picker */}
            {yearOptions.length > 0 && (
                <FilterPill label="Year" allLabel="All years" value={year} options={yearOptions} onChange={onYearChange} />
            )}
            {authorOptions.length > 1 && (
                <FilterPill label="Author" allLabel="All authors" value={author} options={authorOptions} onChange={onAuthorChange} />
            )}
            {genreOptions.length > 1 && (
                <FilterPill label="Genre" allLabel="All genres" value={genre} options={genreOptions} onChange={onGenreChange} />
            )}
            {canClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="rounded-full px-2 py-1.5 text-[13px] font-medium leading-6 text-muted-foreground transition-[color,transform] duration-100 hover:text-foreground active:scale-[0.97]"
                >
                    Clear
                </button>
            )}
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
            className={cn(
                'relative inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full py-1.5 pl-3.5 pr-2.5 text-[13px] font-medium leading-6 ring-1 ring-inset transition-[color,box-shadow,transform] duration-100 ease-out active:scale-[0.97] has-[select:focus-visible]:ring-2 has-[select:focus-visible]:ring-ring',
                active
                    ? 'bg-brand-accent/6 text-brand-accent ring-brand-accent/40'
                    : 'text-muted-foreground ring-border hover:text-foreground',
            )}
        >
            <span className="max-w-40 truncate">{active && selected ? selected.label : label}</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-70" />
            {/* invisible but on top: the pill is the face, the select is the control. text-base stops iOS zooming */}
            <select
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 cursor-pointer appearance-none text-base opacity-0"
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
