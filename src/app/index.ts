import { config } from "dotenv"
import * as express from "express"
import { Database } from "../database"
import { Parser } from "../parser"
import { Downloader } from "../downloader"
import { Emitter } from "../emitter"
import { Kue } from "../queue"

export class App {
    private app: express.Application
    private parser: Parser
    private env: string
    private port: number
    private kue: Kue

    public constructor() {
        this.init()
        this.exec()
    }

    private async init(): Promise<void> {
        config()

        Emitter.init()
        Downloader.init()
        new Database()

        this.app = express()
        this.kue = new Kue()
        this.env = process.env.NODE_ENV || "development"
        this.port = Number(process.env.NODE_PORT) || 3000
    }

    private async exec(): Promise<void> {
        await this.kue.mainGenre({ title: "Main Genre" })
    }

    public start(): any {
        const server = this.app.listen(this.port, () => {
            console.log(`App in [ ${ this.env } ] env start on port ${ this.port }`)
            return server
        })
    }
}