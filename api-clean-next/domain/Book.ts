import { BookGenre } from "./BookGenre"
import { BookStatus } from "./BookStatus"

export class Book {
    private _id: string
    private _title: string
    private _author: string
    private _pages: number
    private _genre?: BookGenre
    private _coverImageUrl?: string
    private _status: BookStatus

    constructor(props: {
        id: string
        title: string
        author: string
        pages: number
        genre?: BookGenre
        coverImageUrl?: string
        status?: BookStatus
    }) {
        this._id = props.id
        this._title = props.title
        this._author = props.author
        this._pages = props.pages
        this._genre = props.genre
        this._coverImageUrl = props.coverImageUrl
        this._status = props.status || BookStatus.NotStarted
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

    get status() {
        return this._status
    }
}