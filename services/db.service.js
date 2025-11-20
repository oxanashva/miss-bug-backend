import { MongoClient } from "mongodb"

import { config } from "../config"
import { loggerService } from "./logger.service.js"

export const dbService = { getCollection }

var dbConn = null

async function getCollection(collectionName) {
    try {
        const db = _connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        loggerService.error("Failed to get Mongo collection", err)
        throw err
    }
}

async function _connect() {
    if (dbConn) return dbConn
    try {
        const client = await MongoClient.connect(config.dbURL)
        return dbConn = client.db(config.dbName)
    } catch (err) {
        loggerService.error("Cannot connect to DB", err)
        throw err
    }
}