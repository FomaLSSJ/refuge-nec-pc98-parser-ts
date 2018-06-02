import { config } from "dotenv"
import * as express from "express"
import { Database } from "../database"
import { Parser } from "../parser"

export class App {
    private app: express.Application
    private parser: Parser
    private env: string
    private port: number

    public constructor() {
        this.init()
        this.exec()
    }

    private async init(): Promise<void> {
        config()

        new Database()

        this.app = express()
        this.parser = new Parser("https://refuge.tokyo/pc9801/")
        this.env = process.env.NODE_ENV || "development"
        this.port = Number(process.env.NODE_PORT) || 3000
    }

    private async exec(): Promise<void> {
        const mainGenres = await this.parser.getMainGenre()
        const subGenres = await this.parser.getSubGenre()
        const games = await this.parser.getGames()
        const game = await this.parser.getGame()

        console.log(mainGenres)
        console.log(subGenres)
        console.log(games)
        console.log(game)

        const data = await Database.get("games").findOneAndUpdate({
            refuge_id: game.refuge_id
        }, {
            $setOnInsert: game
        }, {
            returnOriginal: false,
            upsert: true
        })

        console.log(data)
    }

    public start(): any {
        const server = this.app.listen(this.port, () => {
            console.log(`App in [ ${ this.env } ] env start on port ${ this.port }`)
            return server
        })
    }
}