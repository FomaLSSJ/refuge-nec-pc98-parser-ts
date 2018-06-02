import * as _ from "lodash"
import { load } from "cheerio"
import fetch, { Response } from "node-fetch"
import { IGenre, IGenres, IItem, IItems, IGame } from "../interfaces"

export class Parser {
    private root: string

    public constructor(root: string) {
        this.root = root
    }

    public async getMainGenre(): Promise<IGenres> {
        const URL = `${ this.root }en/Adventure_ABCD.html`
        const response: Response = await fetch(URL, { method: "GET" })
        const body: string = await response.text()
        const $ = load(body)

        let items: IGenres = { genres: [] }

        $("div#genre-navi").find("a").each((i, x): void => {
            const genre: IGenre = {
                title: $(x).find("div.navi_genre").text(),
                link: $(x).attr("href")
            }

            if (_.includes([ "EXIT", "PUBLISHER" ], genre.title)) return

            items.genres.push(genre)
        })

        return items
    }

    public async getSubGenre(): Promise<IGenres> {
        const URL = `${ this.root }en/Adventure_ABCD.html`
        const response: Response = await fetch(URL, { method: "GET" })
        const body: string = await response.text()
        const $ = load(body)

        let items: IGenres = { genres: [] }

        $("div#sub-genre").find("a").each((i, x) => {
            const genre: IGenre = {
                title: $(x).find("div.page").text(),
                link: $(x).attr("href")
            }

            items.genres.push(genre)
        })

        return items
    }

    public async getGames(): Promise<IItems> {
        const URL = `${ this.root }en/Adventure_ABCD.html`
        const response: Response = await fetch(URL, { method: "GET" })
        const body: string = await response.text()
        const $ = load(body)

        let games: IItems = { items: [] }
        let sub: string

        $("div#gamelist").find("tr").each((i, x) => {
            sub = $(x).find("div.list_sub2").text() || sub

            const item: IItem = {
                sub: sub,
                title: $(x).find("div.list_tit").text(),
                link: $(x).find("a").attr("href"),
                pub: $(x).find("td.list_pub").text(),
                rel: Number($(x).find("td.list_rel").text())
            }

            games.items.push(item)
        })

        return games
    }

    public async getGame(): Promise<IGame> {
        const URL = `${ this.root }pc98/01693.html`
        const response: Response = await fetch(URL, { method: "GET" })
        const body: string = await response.text()
        const $ = load(body)

        const [ pub, rel, media ] = $("div#publisher").text().split("|")
        const screens = $("section").find("div#screenshot_a, div#screenshot_b, div#screenshot_c").map((i, x) => {
            console.log(i, $(x).find("a").attr("href"))
            return $(x).find("a").attr("href")
        }).toArray()

        const game: IGame = {
            refuge_id: URL.split("/").pop().split(".").shift(),
            url: URL,
            title_jp: $("div#title_jp").text(),
            title_en: $("div#title_en").text(),
            publisher: pub.split(":").pop().trim(),
            release: Number(rel.split(":").pop().trim()),
            media: media.split(":").pop().trim(),
            screenshots: _.map(screens, x => x.toString()),
            note: $("div#note_b").text()
        }

        return game
    }
}