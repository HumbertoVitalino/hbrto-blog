import { BookGenre } from "./BookGenre"
import { BookStatus } from "./BookStatus"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export class Book {
    private _id: string
    private _title: string
    private _author: string
    private _pages: number
    private _genre?: BookGenre
    private _coverImageUrl?: string
    private _affiliateUrl?: string
    private _status: BookStatus
    private _completedAt?: string

    constructor(props: {
        id: string
        title: string
        author: string
        pages: number
        genre?: BookGenre
        coverImageUrl?: string
        affiliateUrl?: string
        status?: BookStatus
        completedAt?: string | null
    }) {
        this._id = props.id
        this._title = props.title
        this._author = props.author
        this._pages = props.pages
        this._genre = props.genre
        this._coverImageUrl = props.coverImageUrl
        this._affiliateUrl = props.affiliateUrl
        this._status = props.status || BookStatus.NotStarted

        if (props.completedAt && !ISO_DATE.test(props.completedAt)) {
            throw new Error("Completion date must be in YYYY-MM-DD format")
        }
        // a completion date only exists for a finished book
        this._completedAt = this._status === BookStatus.Completed
            ? props.completedAt || undefined
            : undefined
    }

    get id() {
        return this._id
    }

    get title() {
        return this._title
    }

    get author() {
        return this._author
    }

    get pages() {
        return this._pages
    }

    get genre() {
        return this._genre
    }

    get coverImageUrl() {
        return this._coverImageUrl
    }

    get affiliateUrl() { return this._affiliateUrl }
    get status() { return this._status }
    get completedAt() { return this._completedAt }
}
