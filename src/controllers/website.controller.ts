import { NextFunction, Request, Response } from "express"
import db from "../configs/db.config"
import { QueryTypes } from "sequelize"
import CustomHttpError from "../utils/custom-http-error"
import axios from "axios"
import { crawlWebsiteQueue } from "../queues"

export async function getAllWebsites(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const websites = await db.query(
            `SELECT * FROM websites order by id desc`,
            {
                type: QueryTypes.SELECT,
            }
        )
        response.json({
            status: 200,
            message: "ok",
            data: websites,
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

export async function addWebsite(
    request: Request<{
        body: {
            url: string
        }
    }>,
    response: Response,
    next: NextFunction
) {
    const transaction = await db.transaction()
    try {
        const { url } = request.body
        if (!url) {
            throw new CustomHttpError({
                status: 400,
                message: "url is required",
            })
        }
        // validate the url
        const urlRegex = new RegExp(
            "^(http|https)://(www.)?([a-zA-Z0-9-]+).([a-z]+)(.[a-z]+)?$"
        )
        if (!urlRegex.test(url)) {
            throw new CustomHttpError({
                status: 400,
                message: "Invalid url",
            })
        }
        const website = await db.query(
            `SELECT * FROM websites WHERE url = :url`,
            {
                replacements: { url },
                type: QueryTypes.SELECT,
                transaction,
            }
        )
        if (website.length > 0) {
            throw new CustomHttpError({
                status: 400,
                message: "Website already exists",
            })
        }
        try {
            const reachable = await axios.get(url)
            if (reachable.status !== 200) {
                throw new CustomHttpError({
                    status: 400,
                    message: "Website is not valid",
                })
            }
        } catch (error) {
            throw new CustomHttpError({
                status: 400,
                message: "Website is not valid",
            })
        }
        const [insertId] = await db.query(
            `INSERT INTO websites (url) VALUES (:url)`,
            {
                replacements: { url },
                type: QueryTypes.INSERT,
                transaction,
            }
        )
        await transaction.commit()
        response.json({
            status: 201,
            message: "ok",
            data: {
                id: insertId,
                url,
            },
        })
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        next(error)
    }
}

export async function deleteWebsite(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const transaction = await db.transaction()
    try {
        const { id } = request.params
        if (!id) {
            throw new CustomHttpError({
                status: 400,
                message: "id is required",
            })
        }
        const website = await db.query(
            `SELECT * FROM websites WHERE id = :id`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
                transaction,
            }
        )
        if (website.length === 0) {
            throw new CustomHttpError({
                status: 400,
                message: "Website not found",
            })
        }
        await db.query(`DELETE FROM websites WHERE id = :id`, {
            replacements: { id },
            type: QueryTypes.DELETE,
            transaction,
        })
        await transaction.commit()
        response.json({
            status: 200,
            message: "ok",
            data: {
                id,
            },
        })
    } catch (error) {
        await transaction.rollback()
        console.log(error)
        next(error)
    }
}

export async function startCrawling(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const { id } = request.params
        if (!id) {
            throw new CustomHttpError({
                status: 400,
                message: "id is required",
            })
        }
        const website = (await db.query(
            `SELECT * FROM websites WHERE id = :id`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
            }
        )) as { url: string }[]

        if (website.length === 0) {
            throw new CustomHttpError({
                status: 400,
                message: "Website not found",
            })
        }
        // add the job to the queue
        crawlWebsiteQueue.add({
            url: website[0].url,
            websiteId: Number(id),
            parentWebsite: website[0].url,
        })

        response.json({
            status: 200,
            message: "ok",
            data: {
                id,
            },
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}
