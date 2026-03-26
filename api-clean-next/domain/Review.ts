export class Review {
    private _id: string
    private _bookId: string
    private _rating: number
    private _comment: string

    constructor(props: {
        id: string
        bookId: string
        rating: number
        comment: string
    }) {
        this._id = props.id
        this._bookId = props.bookId
        this._rating = props.rating
        this._comment = props.comment
    }

    get id() {
        return this._id
    }

    get bookId() {
        return this._bookId
    }

    get rating() {
        return this._rating
    }

    get comment() {
        return this._comment
    }
}