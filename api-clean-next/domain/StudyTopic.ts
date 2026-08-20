import { StudyTopicStatus } from "./StudyTopicStatus"
import { StudyPriority } from "./StudyPriority"

export class StudyTopic {
    private _id: string
    private _title: string
    private _description?: string
    private _status: StudyTopicStatus
    private _priority: StudyPriority
    private _resourceUrl?: string
    private _createdAt: Date

    constructor(props: {
        id: string
        title: string
        description?: string
        status?: StudyTopicStatus
        priority?: StudyPriority
        resourceUrl?: string
        createdAt?: Date
    }) {
        this._id = props.id
        this._title = props.title
        this._description = props.description
        this._status = props.status ?? StudyTopicStatus.Planned
        this._priority = props.priority ?? StudyPriority.Medium
        this._resourceUrl = props.resourceUrl
        this._createdAt = props.createdAt ?? new Date()
    }

    get id() { return this._id }
    get title() { return this._title }
    get description() { return this._description }
    get status() { return this._status }
    get priority() { return this._priority }
    get resourceUrl() { return this._resourceUrl }
    get createdAt() { return this._createdAt }
}
