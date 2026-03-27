import { BookGenre } from "./BookGenre"

export class Book {
    private _id: string
    private _title: string
    private _author: string
    private _pages: number
    private _genre?: BookGenre

    constructor(props: {
        id: string
        title: string
        author: string
        pages: number
        genre?: BookGenre
    }) {
        this._id = props.id
        this._title = props.title
        this._author = props.author
        this._pages = props.pages
        this._genre = props.genre
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
}