export class RecentTrack {
    private _title: string
    private _artist: string
    private _album: string
    private _albumImageUrl: string
    private _songUrl: string
    private _playedAt: Date

    constructor(props: {
        title: string
        artist: string
        album: string
        albumImageUrl: string
        songUrl: string
        playedAt: Date
    }) {
        this._title = props.title
        this._artist = props.artist
        this._album = props.album
        this._albumImageUrl = props.albumImageUrl
        this._songUrl = props.songUrl
        this._playedAt = props.playedAt
    }

    get title() { return this._title }
    get artist() { return this._artist }
    get album() { return this._album }
    get albumImageUrl() { return this._albumImageUrl }
    get songUrl() { return this._songUrl }
    get playedAt() { return this._playedAt }
}
