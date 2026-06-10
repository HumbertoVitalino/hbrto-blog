import { GamePlatform } from './GamePlatform'
import { GameStatus } from './GameStatus'

export class Game {
    private _id: string
    private _title: string
    private _platform: GamePlatform
    private _genre?: string
    private _status: GameStatus
    private _coverImageUrl?: string
    private _totalHours?: number

    constructor(props: {
        id: string
        title: string
        platform: GamePlatform
        genre?: string
        status?: GameStatus
        coverImageUrl?: string
        totalHours?: number
    }) {
        this._id = props.id
        this._title = props.title
        this._platform = props.platform
        this._genre = props.genre
        this._status = props.status ?? GameStatus.NotStarted
        this._coverImageUrl = props.coverImageUrl
        this._totalHours = props.totalHours
    }

    get id() { return this._id }
    get title() { return this._title }
    get platform() { return this._platform }
    get genre() { return this._genre }
    get status() { return this._status }
    get coverImageUrl() { return this._coverImageUrl }
    get totalHours() { return this._totalHours }
}
