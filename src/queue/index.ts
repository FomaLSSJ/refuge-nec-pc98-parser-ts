import { createQueue, Queue, app, Job } from "kue"
import { Parser } from "../parser"
import { Downloader } from "../downloader"

export class Kue {
    private root: string
    private prefix: string
    private lang: string
    private queue: Queue
    private parser: Parser

    public constructor() {
        this.root = "https://refuge.tokyo/pc9801"
        this.prefix = "pc98"
        this.lang = "en"
        this.queue = createQueue()
        this.parser = new Parser(this.root, this.prefix, this.lang)
        this.init()
    }

    private init() {
        app.listen(process.env.KUE_PORT || 4000)

        this.queue.process("main_genre", async (job, done) => {
            try {
                const result = await this.parser.getMainGenre()
                return done(undefined, result)
            } catch (err) {
                console.error(err)
                return done(err)
            }
        })

        this.queue.process("sub_genre", async ({ data }, done) => {
            try {
                const result = await this.parser.getSubGenre(data)
                return done(undefined, result)
            } catch (err) {
                console.error(err)
                return done(err)
            }
        })

        this.queue.process("games", async ({ data }, done) => {
            try {
                const result = await this.parser.getGames(data)
                return done(undefined, result)
            } catch (err) {
                console.error(err)
                return done(err)
            }
        })

        this.queue.process("game", async ({ data }, done) => {
            try {
                const result = await this.parser.getGame(data)
                if (!result) {
                    throw new Error("Game empty")
                }
                return done(undefined, result)
            } catch (err) {
                console.error(err)
                return done(err)
            }
        })

        this.queue.process("download", async ({ id, data }, done) => {
            try {
                await Downloader.download(data.link, data.title)
                return done(undefined, data)
            } catch (err) {
                console.error(err)
                return done(err)
            }
        })
    }

    public async mainGenre(opts: object): Promise<void> {
        try {
            const job = await this.queue.create("main_genre", opts).save()
            job.on("complete", ({ genres }) => {
                genres.forEach(async genre => {
                    console.log(genre.title)
                    await this.subGenre(genre)
                })
            })
        } catch (err) {
            console.error(err)
        }
    }

    public async subGenre(opts: object): Promise<void> {
        try {
            const job = await this.queue.create("sub_genre", opts).save()
            job.on("complete", ({ genres }) => {
                genres.forEach(async genre => {
                    console.log(genre.title)
                    genre[ "main" ] = opts[ "title" ]
                    await this.games(genre)
                })
            })
        } catch (err) {
            console.error(err)
        }
    }

    public async games(opts: object): Promise<void> {
        try {
            const job = await this.queue.create("games", opts).save()
            job.on("complete", ({ items }) => {
                items.forEach(async game => {
                    game[ "category" ] = opts[ "main" ].toLowerCase()
                    game[ "genre" ] = opts[ "title" ].toLowerCase()
                    game[ "sub" ] = game[ "sub" ] ? game[ "sub" ].toLowerCase() : game[ "sub" ]
                    game[ "link" ] = game[ "link" ].split("/").pop()
                    return await this.game(game)
                })
            })
        } catch (err) {
            console.error(err)
        }
    }

    public async game(opts: object): Promise<void> {
        try {
            const job = await this.queue.create("game", opts).save()
            job.on("complete", result => {
                if (!result) {
                    return console.error("Game empty")
                }

                const { refuge_id, title_en, screenshots, archives } = result
                console.log(`Complete refuge_id ${ refuge_id }, title ${ title_en }`)
                screenshots.map(async x => await this.download({ link: `${ this.root }/${ this.prefix }/${ x }`, title: x.toString() }))
                archives.map(async x => await this.download({ link: `${ this.root }/${ this.prefix }/${ x }`, title: x.toString() }))
            })
        } catch (err) {
            console.error(err)
        }
    }

    public async download(opts: object): Promise<void> {
        try {
            const job = await this.queue.create("download", opts).save()
            job.on("complete", result => {
                console.log(`Download ${ result.title }`)
            })
        } catch (err) {
            console.error(err)
        }
    }
}