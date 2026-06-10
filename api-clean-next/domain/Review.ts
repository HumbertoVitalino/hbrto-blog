export type ReviewLanguage = 'en' | 'pt-BR'

export class Review {
    private _id: string
    private _title: string
    private _bookId: string | null
    private _rating: number
    private _comment: string
    private _createdAt: Date
    private _language: ReviewLanguage

    constructor(props: {
        id: string
        title: string
        bookId: string | null
        rating: number
        comment: string
        createdAt?: Date
        language?: ReviewLanguage
    }) {
        this._id = props.id
        this._title = props.title
        this._bookId = props.bookId
        this._rating = props.rating
        this._comment = props.comment
        this._createdAt = props.createdAt || new Date()
        this._language = props.language ?? 'en'
    }

    get id() { return this._id }
    get title() { return this._title }
    get bookId() { return this._bookId }
    get rating() { return this._rating }
    get comment() { return this._comment }
    get createdAt() { return this._createdAt }
    get language() { return this._language }
}