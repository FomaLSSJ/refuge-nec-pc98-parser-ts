import { existsSync, mkdirSync, createWriteStream } from "fs"
import * as path from "path"
import axios from "axios"

export class Downloader {
    static init(): void {
        const screenshotPath = path.join(__dirname, "../screenshot")
        const archivePath = path.join(__dirname, "../archive")
        const thumbnailPath = path.join(__dirname, "../thumbnail")

        if (!existsSync(screenshotPath)) {
            mkdirSync(screenshotPath)
        }

        if (!existsSync(archivePath)) {
            mkdirSync(archivePath)
        }

        if (!existsSync(thumbnailPath)) {
            mkdirSync(thumbnailPath)
        }
    }

    static async download(url: string, name: string): Promise<void> {
        const res = await axios({
            url: url,
            method: "GET",
            responseType: "stream"
        })
        res.data.pipe(createWriteStream(path.join(__dirname, "../", name)))
    }
}