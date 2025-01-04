import { QueryTypes } from "sequelize"
import db from "./configs/db.config"

export async function init_db() {
    /** Websites db */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS websites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TRIGGER update_timestamp_websites
            AFTER UPDATE
            ON websites
            BEGIN
                UPDATE websites SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
            END
        `
    )
    /** Website all crawled urls */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS crawled_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                website_id INTEGER NOT NULL,
                FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
            )
        `
    )
    /** website product description page urls (crawled_urls processed ones) */
    await db.query(
        `
            CREATE TABLE IF NOT EXISTS product_description_urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL UNIQUE,
                website_id INTEGER NOT NULL,
                meta JSON DEFAULT NULL,
                FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
            )
        `
    )
}
