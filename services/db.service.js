import mongoDB from 'mongodb'
const { MongoClient } = mongoDB

import { config } from '../config/index.js'
import { logger } from './logger.service.js'

export const dbService = {
    getCollection
}

var dbConn = null

async function getCollection(collectionName) {
    try {
        const db = await connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}

async function connect() {
    if (dbConn) return dbConn
    try {
        // (node:9304) [MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option: useNewUrlParser, useUnifiedTopology has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version
        // const client = await MongoClient.connect(config.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
        const client = await MongoClient.connect(config.dbURL)
        const db = client.db(config.dbName)
        dbConn = db
        return db
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}




