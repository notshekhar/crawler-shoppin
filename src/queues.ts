import { crawlWebsiteProcess } from "./queue-process/crawl-website"
import SqliteQueue from "./lib/sqlite-queue"
import { filterProductUrlProcess } from "./queue-process/filter-product-urls"

export const crawlWebsiteQueue = new SqliteQueue<{
    websiteId: number
    url: string
    parentWebsite: string
}>("crawl-website-queue")

export const filterProductDescriptionQueue = new SqliteQueue<{
    websiteId: number
    url: string
}>("filter-product-description-queue")

crawlWebsiteQueue.process(crawlWebsiteProcess, 4)

filterProductDescriptionQueue.process(filterProductUrlProcess, 10)
