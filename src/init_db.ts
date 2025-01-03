import { QueryTypes } from "sequelize"
import db from "./configs/db.config"

export async function init_db() {
    /** Websites db */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS websites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE
            )
        `,
        {
            type: QueryTypes.RAW,
        }
    )
    /** Website all crawled urls */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS crawled_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                website_id INTEGER NOT NULL,
                FOREIGN KEY (website_id) REFERENCES websites(id)
            )
        `,
        {
            type: QueryTypes.RAW,
        }
    )
    /** website product description page urls (crawled_urls processed ones) */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS product_description_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                website_id INTEGER NOT NULL,
                meta JSON DEFAULT NULL,
                FOREIGN KEY (website_id) REFERENCES websites(id)
            )
        `,
        {
            type: QueryTypes.RAW,
        }
    )
}
