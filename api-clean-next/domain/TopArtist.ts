export class TopArtist {
    private _name: string
    private _imageUrl: string
    private _genres: string[]
    private _artistUrl: string

    constructor(props: {
        name: string
        imageUrl: string
        genres: string[]
        artistUrl: string
    }) {
        this._name = props.name
        this._imageUrl = props.imageUrl
        this._genres = props.genres
        this._artistUrl = props.artistUrl
    }

    get name() { return this._name }
    get imageUrl() { return this._imageUrl }
    get genres() { return this._genres }
    get artistUrl() { return this._artistUrl }
}
