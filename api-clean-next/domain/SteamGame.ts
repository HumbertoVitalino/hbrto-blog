export class SteamGame {
    private _appId: number
    private _name: string
    private _playtimeForever: number
    private _playtime2weeks: number
    private _headerImageUrl: string

    constructor(props: {
        appId: number
        name: string
        playtimeForever: number
        playtime2weeks: number
        headerImageUrl: string
    }) {
        this._appId = props.appId
        this._name = props.name
        this._playtimeForever = props.playtimeForever
        this._playtime2weeks = props.playtime2weeks
        this._headerImageUrl = props.headerImageUrl
    }

    get appId() { return this._appId }
    get name() { return this._name }
    get playtimeForever() { return this._playtimeForever }
    get playtime2weeks() { return this._playtime2weeks }
    get headerImageUrl() { return this._headerImageUrl }
}
