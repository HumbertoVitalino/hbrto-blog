import { Review } from '@/domain/Review'

/**
 * Groups reviews with the same title as language variants of the same entry.
 * Map preserves insertion order, so any sort priority applied by the caller is kept.
 */
export function groupReviewsByTitle(reviews: Review[]): Review[][] {
    const map = new Map<string, Review[]>()
    for (const r of reviews) {
        const key = r.title.trim().toLowerCase()
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(r)
    }
    return Array.from(map.values())
}
