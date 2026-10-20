export interface Photo {
    src: string
    /** what the print says on its back, like a file name on a contact sheet */
    file: string
    caption: string
    alt: string
}

/** The home page's strip, left to right. Only real photos belong here. */
export const STRIP_PHOTOS: Photo[] = [
    { src: '/photos/snow.webp', file: 'snow.jpeg', caption: 'snow on the roofs', alt: 'Snow on the wooden roofs of a ski town, apartment towers in the fog behind' },
    { src: '/photos/mountains.webp', file: 'mountains.jpeg', caption: 'vineyard under the mountains', alt: 'Humberto in profile in front of snow-capped mountains and a vineyard' },
    { src: '/photos/cat.webp', file: 'cat.jpeg', caption: 'the desk can wait', alt: 'A cream cat lying upside down on a bed, a desk with two chairs behind' },
    { src: '/photos/lookout.webp', file: 'lookout.jpeg', caption: 'the whole city from up there', alt: 'Someone looking through coin-operated binoculars over a city, mountains on the horizon' },
    { src: '/photos/reviewer.webp', file: 'reviewer.jpeg', caption: 'approved: clean architecture', alt: 'The cream cat sitting on a copy of Clean Architecture on a bookshelf' },
]

export const ABOUT_PHOTO: Photo = {
    src: '/photos/me.webp',
    file: 'me.jpeg',
    caption: 'golden hour, with the cat',
    alt: 'Humberto lying on a couch in warm evening light, the cream cat leaning over him',
}
