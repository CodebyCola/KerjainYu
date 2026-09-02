import { EventEmitter } from "events"

export const notificationEmitter = new EventEmitter()
notificationEmitter.setMaxListeners(0)
