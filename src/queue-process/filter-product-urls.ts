import axios from "axios"
import { JSDOM } from "jsdom"

import { JobAttributes } from "../lib/sqlite-queue"
import { QueryTypes } from "sequelize"
import db from "../configs/db.config"

export async function filterProductUrlProcess(
    job: JobAttributes<{
        websiteId: number
        url: string
    }>,
    done: (error?: any) => void
) {
    try {
        const response = await axios.get(job.data.url)
        const dom = new JSDOM(response.data, {
            runScripts: "dangerously",
        })
        const ldJsonNodes = dom.window.document.querySelectorAll(
            'script[type="application/ld+json"]'
        )
        for (const ldJsonNode of ldJsonNodes) {
            const ldJson = JSON.parse(ldJsonNode.innerHTML)
            if (ldJson["@type"] === "Product") {
                // save the url in product_description_urls table
                await saveProductDescriptionUrl(
                    job.data.url,
                    job.data.websiteId
                )
            }
        }
    } catch (error) {
        done(error)
    }
}

async function saveProductDescriptionUrl(url: string, websiteId: number) {
    try {
        await db.query(
            `
            INSERT INTO product_description_urls (url, website_id)
            VALUES (:url, :website_id)
        `,
            {
                replacements: {
                    url,
                    website_id: websiteId,
                },
                type: QueryTypes.INSERT,
            }
        )
    } catch (error) {
        console.error("Error saving product description url", error)
    }
}
