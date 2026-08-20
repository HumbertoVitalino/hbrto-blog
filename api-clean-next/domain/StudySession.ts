import { PomodoroPhaseType } from "./PomodoroPhaseType"

export class StudySession {
    private _id: string
    private _topicId: string
    private _phaseType: PomodoroPhaseType
    private _plannedSeconds: number
    private _actualSeconds: number
    private _completed: boolean
    private _startedAt: Date
    private _endedAt: Date

    constructor(props: {
        id: string
        topicId: string
        phaseType: PomodoroPhaseType
        plannedSeconds: number
        actualSeconds: number
        completed?: boolean
        startedAt: Date
        endedAt?: Date
    }) {
        this._id = props.id
        this._topicId = props.topicId
        this._phaseType = props.phaseType
        this._plannedSeconds = props.plannedSeconds
        this._actualSeconds = props.actualSeconds
        this._completed = props.completed ?? false
        this._startedAt = props.startedAt
        this._endedAt = props.endedAt ?? new Date()
    }

    get id() { return this._id }
    get topicId() { return this._topicId }
    get phaseType() { return this._phaseType }
    get plannedSeconds() { return this._plannedSeconds }
    get actualSeconds() { return this._actualSeconds }
    get completed() { return this._completed }
    get startedAt() { return this._startedAt }
    get endedAt() { return this._endedAt }
}
