import { MongoClient, Db, Collection } from "mongodb"
import { GameScheme } from "./schemes/game"
import { Emitter } from "../emitter"

let database: Db

export class Database {
    public constructor() {
        this.init()
    }

    private async init(): Promise<void> {
        const { MONGO_HOST, MONGO_PORT, MONGO_DBNAME, MONGO_USER, MONGO_PASS } = process.env
        const URL = MONGO_USER && MONGO_PASS
            ? `mongodb://${ MONGO_USER }:${ MONGO_PASS }@${ MONGO_HOST }:${ MONGO_PORT }/${ MONGO_DBNAME }`
            : `mongodb://${ MONGO_HOST }:${ MONGO_PORT }/${ MONGO_DBNAME }`

        try {
            const connect = await MongoClient.connect(URL)
            database = connect.db(MONGO_DBNAME)
            Emitter.instance.emit("dbinit")
            this.schemes()
        } catch (err) {
            console.error(err)
        }
    }

    private async schemes(): Promise<void> {
        await new GameScheme(database)
    }

    public static get database(): Db {
        return database
    }

    public static get(name): Collection {
        return name ? database.collection(name) : undefined
    }
}