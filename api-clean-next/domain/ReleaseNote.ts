export class ReleaseNote {
    private _id: string
    private _version: string
    private _title: string
    private _description: string
    private _publishedAt: Date

    constructor(props: {
        id: string
        version: string
        title: string
        description: string
        publishedAt?: Date
    }) {
        this._id = props.id
        this._version = props.version
        this._title = props.title
        this._description = props.description
        this._publishedAt = props.publishedAt || new Date()
    }

    get id() { return this._id }
    get version() { return this._version }
    get title() { return this._title }
    get description() { return this._description }
    get publishedAt() { return this._publishedAt }
}
