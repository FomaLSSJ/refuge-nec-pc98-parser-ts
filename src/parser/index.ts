import * as _ from "lodash"
import { load } from "cheerio"
import fetch, { Response } from "node-fetch"
import { IGenre, IGenres, IItem, IItems, IGame } from "../interfaces"
import { Database } from "../database"

export class Parser {
    private root: string
    private prefix: string
    private lang: string

    public constructor(root: string, prefix: string, lang: string) {
        this.root = root
        this.prefix = prefix
        this.lang = lang
    }

    public async getMainGenre(): Promise<IGenres> {
        try {
            const URL = `${ this.root }/${ this.lang }/Adventure_ABCD.html`
            const response: Response = await fetch(URL, { method: "GET" })
            const body: string = await response.text()
            const $ = load(body)

            const items: IGenres = { genres: [] }

            $("div#genre-navi").find("a").each((i, x): void => {
                const genre: IGenre = {
                    title: $(x).find("div.navi_genre").text().trim(),
                    link: $(x).attr("href")
                }

                if (_.includes([ "EXIT", "PUBLISHER" ], genre.title)) return

                items.genres.push(genre)
            })

            return items
        } catch (err) {
            console.error(err)
        }
    }

    public async getSubGenre(opts: object = {}): Promise<IGenres> {
        try {
            const URL = `${ this.root }/${ this.lang }/${ opts[ "link" ] }`
            const response: Response = await fetch(URL, { method: "GET" })
            const body: string = await response.text()
            const $ = load(body)

            const items: IGenres = { genres: [] }

            $("div#sub-genre, div#sub-genre-fix").find("a").each((i, x) => {
                const genre: IGenre = {
                    title: $(x).find("div.page").text().trim(),
                    link: $(x).attr("href")
                }

                items.genres.push(genre)
            })

            return items
        } catch (err) {
            console.error(err)
        }
    }

    public async getGames(opts: object = {}): Promise<IItems> {
        try {
            const URL = `${ this.root }/${ this.lang }/${ opts[ "link" ] }`
            const response: Response = await fetch(URL, { method: "GET" })
            const body: string = await response.text()
            const $ = load(body)

            const games: IItems = { items: [] }

            let sub: string

            $("div#gamelist, div#gamelist2").find("tr").each((i, x) => {
                sub = $(x).find("div.list_sub2").text() || sub

                const item: IItem = {
                    sub: sub,
                    title: $(x).find("div.list_tit, div.list_titex").text().trim(),
                    link: $(x).find("a").attr("href"),
                    pub: $(x).find("td.list_pub").text(),
                    rel: Number($(x).find("td.list_rel").text())
                }

                games.items.push(item)
            })

            return games
        } catch (err) {
            console.error(err)
        }
    }

    public async getGame(opts: object = {}): Promise<IGame> {
        try {
            const URL = `${ this.root }/${ this.prefix }/${ opts[ "link" ] }`
            const response: Response = await fetch(URL, { method: "GET" })
            const body: string = await response.text()
            const $ = load(body)

            const err404 = $("section").find("div#err").text()
            if (err404 === "404 Not Found") {
                throw new Error("404 Not Found")
            }

            const data = this.serializeData($("div#publisher").text())
            const cover = $("section").find("div#cover a").attr("href")
            const rewiev = $("section").find("div#review").text()

            let screenshots = $("section").find("div#screenshot_a, div#screenshot_b, div#screenshot_c").map((i, x) => $(x).find("a").attr("href")).toArray()
            const archives = $("section").find("div#thumbnail a, div#thumbnail_re a").map((i, x) => $(x).attr("href")).toArray()
            if (!screenshots.length) {
                screenshots = $("section").find("div#screenshot_a, div#screenshot_b, div#screenshot_c").map((i, x) => $(x).find("img").attr("src")).toArray()
            }

            const game: IGame = {
                refuge_id: URL.split("/").pop().split(".").shift(),
                url: URL,
                prefix: `${ this.root }/${ this.prefix }/`,
                title_jp: $("div#title_jp").text(),
                title_en: $("div#title_en").text(),
                publisher_jp: data[ "publisher" ] ? data[ "publisher" ][ "publisher_jp" ] : undefined,
                publisher_en: data[ "publisher" ] ? data[ "publisher" ][ "publisher_en" ] : undefined,
                release: data[ "release" ] || undefined,
                media_data: data[ "media" ] ? data[ "media" ][ "media_data" ] : undefined,
                media_count: data[ "media" ] ? data[ "media" ][ "media_count" ] || 0 : 0,
                developer_jp: data[ "developer" ] ? data[ "developer" ][ "developer_jp" ] : undefined,
                developer_en: data[ "developer" ] ? data[ "developer" ][ "developer_en" ] : undefined,
                screenshots: screenshots.map(x => x.toString()),
                archives: archives.map(x => x.toString()),
                cover: cover || undefined,
                review: rewiev || undefined,
                note: $("div#note_b").text() || undefined,
                category: opts[ "category" ],
                genre: opts[ "genre" ],
                sub: opts[ "sub" ]
            }

            await Database.get("games").findOneAndUpdate({
                refuge_id: game.refuge_id
            }, {
                $setOnInsert: game
            }, {
                returnOriginal: false,
                upsert: true
            })

            return game
        } catch (err) {
            console.error(opts, err)
        }
    }

    private serializeData(value: string): object {
        const datas = value.split("|")
        const result = {}

        datas.forEach(x => {
            const [ key, val ] = x.split(":")
            const keyLower = key.trim().toLowerCase()

            switch (keyLower) {
                case "release":
                    result[ keyLower ] = Number(val) || undefined
                    break
                case "media":
                    const media = val.split("*")
                    if (media.length > 1) {
                        result[ keyLower ] = {
                            media_data: media[ 0 ],
                            media_count: Number(media[ 1 ])
                        }
                    } else {
                        result[ keyLower ] = {
                            media_data: "floppydisk",
                            media_count: undefined
                        }
                    }
                    break
                default:
                    const re = new RegExp(/(.*).\((.*)\)/, "s")
                    const matches = val.match(re)
                    if (matches) {
                        result[ keyLower ] = {
                            [ `${ keyLower }_jp` ]: matches[ 1 ],
                            [ `${ keyLower }_en` ]: matches[ 2 ]
                        }
                    } else {
                        result[ keyLower ] = {
                            [ `${ keyLower }_jp` ]: undefined,
                            [ `${ keyLower }_en` ]: val || undefined
                        }
                    }
                    break
            }
        })

        return result
    }
}