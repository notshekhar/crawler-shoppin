import axios from "axios"
import { JSDOM } from "jsdom"
import jsonld from "jsonld"

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
        // if (!isProductUrl(job.data.url)) {
        //     await saveProductDescriptionUrl(job.data.url, job.data.websiteId)
        //     done()
        //     return
        // }
        const response = await axios.get(job.data.url)
        const dom = new JSDOM(response.data, {
            runScripts: "dangerously",
        })
        const ldJsonNodes = dom.window.document.querySelectorAll(
            'script[type="application/ld+json"]'
        )
        for (const ldJsonNode of ldJsonNodes) {
            const ldJson = JSON.parse(ldJsonNode.innerHTML)
            const expandedLdJson = await jsonld.expand(ldJson)
            for (const ldJson of expandedLdJson) {
                if (ldJson["@type"]?.includes("http://schema.org/Product")) {
                    await saveProductDescriptionUrl(
                        job.data.url,
                        job.data.websiteId
                    )
                    done()
                    return
                }
            }
        }
        // if add to cart button is found then it is a product page or input fields
        // const buttonNodes = dom.window.document.querySelectorAll(
        //     'button, input[type="button"], input[type="submit"], input[type="text"]'
        // )
        // for (const buttonNode of buttonNodes) {
        //     const regexp = new RegExp(
        //         /(add to cart|buy now|add to basket|checkout|purchase|order|add to bag)/i
        //     )
        //     const buttonContent =
        //         buttonNode?.textContent?.trim().toLowerCase() || null
        //     if (
        //         buttonContent &&
        //         buttonContent.match(regexp) &&
        //         buttonContent.length > 0
        //     ) {
        //         await saveProductDescriptionUrl(
        //             job.data.url,
        //             job.data.websiteId
        //         )
        //         done()
        //         return
        //     }
        // }
        done()
    } catch (error) {
        done(error)
    }
}

function isProductUrl(url: string) {
    const patterns = [
        /\/product\//i,
        /\/item\//i,
        /\/p\/\d+/i, // Matches URLs like /p/12345
        /\/shop\//i,
        /\/buy\//i,
        /\/detail\//i,
    ]
    return patterns.some((pattern) => pattern.test(url))
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
