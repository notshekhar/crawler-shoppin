import axios from "axios"
import { JSDOM } from "jsdom"

import { JobAttributes } from "../lib/sqlite-queue"
import db from "../configs/db.config"
import { QueryTypes } from "sequelize"
import { crawlWebsiteQueue, filterProductDescriptionQueue } from "../queues"

export async function crawlWebsiteProcess(
    job: JobAttributes<{
        websiteId: number
        url: string
        parentWebsite: string
    }>,
    done: (error?: any) => void
) {
    try {
        if (job.data.parentWebsite !== new URL(job.data.url).origin) {
            console.log("Skipping external link", job.data.url)
            done()
            return
        }
        console.log("Crawling website", job.data.url)
        await crawlLinks(
            job.data.parentWebsite,
            job.data.websiteId,
            job.data.url
        )
        done()
    } catch (error: any) {
        done(error)
    }
}

async function crawlLinks(
    parentWebsite: string,
    websiteId: number,
    link: string
) {
    try {
        const response = await axios.get(link)
        const dom = new JSDOM(response.data, {
            runScripts: "dangerously",
        })
        const linkNodes = dom.window.document.querySelectorAll("a")
        const links = Array.from(linkNodes).map((linkNode) => linkNode.href)
        if (links.length === 0) {
            console.log("No links found")
            return false
        }
        // if links do not have domain/url then add the domain to it
        const domain = new URL(link).origin
        const processedLinks = links.map((link) => {
            if (link.startsWith("http")) {
                return link
            }
            return domain + link
        })

        for (const link of processedLinks) {
            try {
                await db.query(
                    `INSERT INTO crawled_urls (url, website_id) VALUES (:url, :website_id)`,
                    {
                        replacements: {
                            url: link,
                            website_id: websiteId,
                        },
                        type: QueryTypes.INSERT,
                    }
                )
                await filterProductDescriptionQueue.add({
                    url: link,
                    websiteId,
                })
                await crawlWebsiteQueue.add({
                    url: link,
                    websiteId,
                    parentWebsite,
                })
                console.log("Added link", link)
            } catch (error) {
                console.log("Duplicate link", link)
            }
        }
        return true
    } catch (error) {
        throw error
    }
}
