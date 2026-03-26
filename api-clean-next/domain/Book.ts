export class Book {
    private _id: string
    private _title: string
    private _author: string
    private _pages: number

    constructor(props: {
        id: string
        title: string
        author: string
        pages: number
    }) {
        this._id = props.id
        this._title = props.title
        this._author = props.author
        this._pages = props.pages
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
}