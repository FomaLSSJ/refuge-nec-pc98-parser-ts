export interface IGenre {
    title: string,
    link: string
}

export interface IGenres {
    genres: IGenre[]
}

export interface IItem {
    sub: string,
    title: string,
    link: string,
    pub: string,
    rel?: number
}

export interface IItems {
    items: IItem[]
}

export interface IGame {
    refuge_id: string,
    url: string,
    title_jp: string,
    title_en: string,
    publisher: string,
    release: number,
    media: string,
    screenshots?: string[],
    note?: string
}