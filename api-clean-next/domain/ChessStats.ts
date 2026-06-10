export interface ChessRating {
    last: number
    best: number
    record: { win: number; loss: number; draw: number }
}

export class ChessStats {
    private _username: string
    private _bullet?: ChessRating
    private _blitz?: ChessRating
    private _rapid?: ChessRating
    private _daily?: ChessRating
    private _tacticsHighest?: number

    constructor(props: {
        username: string
        bullet?: ChessRating
        blitz?: ChessRating
        rapid?: ChessRating
        daily?: ChessRating
        tacticsHighest?: number
    }) {
        this._username = props.username
        this._bullet = props.bullet
        this._blitz = props.blitz
        this._rapid = props.rapid
        this._daily = props.daily
        this._tacticsHighest = props.tacticsHighest
    }

    get username() { return this._username }
    get bullet() { return this._bullet }
    get blitz() { return this._blitz }
    get rapid() { return this._rapid }
    get daily() { return this._daily }
    get tacticsHighest() { return this._tacticsHighest }
}
