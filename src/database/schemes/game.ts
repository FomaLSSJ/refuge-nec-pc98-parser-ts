import * as _ from "lodash"
import { Db } from "mongodb"

export class GameScheme {
    private database: Db

    public constructor(database: Db) {
        this.database = database
        this.init()
    }

    private async init(): Promise<void> {
        const collections = await this.database.listCollections().toArray()
        if (_.find(collections, x => x.name == "games")) return
        await this.database.createCollection("downloads", {
            validator: {
                bsonType: "object",
                required: [
                    "url",
                    "prefix",
                    "title_jp",
                    "title_en",
                    "publisher_jp",
                    "publisher_en",
                    "release",
                    "media_data",
                    "media_count",
                    "category",
                    "genre",
                    "sub"
                ],
                properties: {
                    refuge_id: { bsonType: "string" },
                    url: { bsonType: "string" },
                    prefix: { bsonType: "string" },
                    title_jp: { bsonType: "string" },
                    title_en: { bsonType: "string" },
                    publisher_jp: { bsonType: "string" },
                    publisher_en: { bsonType: "string" },
                    category: { bsonType: "string" },
                    genre: { bsonType: "string" },
                    sub: { bsonType: "string" },
                    release: { bsonType: "number" },
                    media: { bsonType: "string" },
                    screenshots: { bsonType: "array" },
                    archives: { bsonType: "array" },
                    developer_jp: { bsonType: "string" },
                    developer_en: { bsonType: "string" },
                    cover: { bsonType: "string" },
                    rewiev: { bsonType: "string" },
                    note: { bsonType: "string" }
                }
            },
            validationAction: "warn",
            validationLevel: "strict"
        })
        await this.database.collection("games").createIndex({ refuge_id: 1 }, { unique: true })
    }
}