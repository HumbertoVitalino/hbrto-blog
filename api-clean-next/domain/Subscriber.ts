export class Subscriber {
    private _id: string
    private _email: string
    private _subscribedAt: Date
    private _isActive: boolean

    constructor(props: {
        id: string
        email: string
        subscribedAt?: Date
        isActive?: boolean
    }) {
        this._id = props.id
        this._email = props.email
        this._subscribedAt = props.subscribedAt || new Date()
        this._isActive = props.isActive ?? true
    }

    get id() {
        return this._id
    }

    get email() {
        return this._email
    }

    get subscribedAt() {
        return this._subscribedAt
    }

    get isActive() {
        return this._isActive
    }
}
