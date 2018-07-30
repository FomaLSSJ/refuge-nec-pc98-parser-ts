import { EventEmitter } from "events"

let events: EventEmitter

export class Emitter {
    public static init(): void {
        events = new EventEmitter()
    }

    public static get instance(): EventEmitter {
        return events
    }
}