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
    prefix: string,
    title_jp: string,
    title_en: string,
    publisher_jp: string,
    publisher_en: string,
    release: number,
    media_data: string,
    media_count: number,
    category: string,
    genre: string,
    sub: string,
    screenshots?: string[],
    archives?: string[],
    developer_jp?: string,
    developer_en?: string,
    cover?: string,
    review?: string,
    note?: string
}