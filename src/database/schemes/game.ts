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
        if (_.find(collections, { name: "games" })) return
        await this.database.createCollection("downloads", {
            validator: {
                bsonType: "object",
                required: [
                    "url",
                    "title_jp",
                    "title_en",
                    "publisher",
                    "release",
                    "media"
                ],
                properties: {
                    refuge_id: { bsonType: "string" },
                    url: { bsonType: "string" },
                    title_jp: { bsonType: "string" },
                    title_en: { bsonType: "string" },
                    publisher: { bsonType: "string" },
                    release: { bsonType: "number" },
                    media: { bsonType: "string" },
                    screenshots: { bsonType: "array" },
                    note: { bsonType: "string" }
                }
            },
            validationAction: "warn",
            validationLevel: "strict"
        })
        await this.database.collection("games").createIndex({ refuge_id: 1 }, { unique: true })
    }
}