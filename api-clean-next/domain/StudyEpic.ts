import { StudyEpicStatus } from "./StudyEpicStatus"

export class StudyEpic {
    private _id: string
    private _title: string
    private _description?: string
    private _status: StudyEpicStatus
    private _color: string
    private _targetSeconds?: number
    private _createdAt: Date

    constructor(props: {
        id: string
        title: string
        description?: string
        status?: StudyEpicStatus
        color?: string
        targetSeconds?: number
        createdAt?: Date
    }) {
        this._id = props.id
        this._title = props.title
        this._description = props.description
        this._status = props.status ?? StudyEpicStatus.Planned
        this._color = props.color ?? "chart-1"
        this._targetSeconds = props.targetSeconds
        this._createdAt = props.createdAt ?? new Date()
    }

    get id() { return this._id }
    get title() { return this._title }
    get description() { return this._description }
    get status() { return this._status }
    get color() { return this._color }
    get targetSeconds() { return this._targetSeconds }
    get createdAt() { return this._createdAt }
}
