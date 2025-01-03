import { NextFunction, Request, Response } from "express"
import CustomHttpError from "../utils/custom-http-error"

export default function ErrorHandler(
    error: Error | CustomHttpError,
    request: Request,
    response: Response,
    next: NextFunction
) {
    if (error instanceof CustomHttpError) {
        return response.status(error.status).json({
            status: error.status,
            message: error.message,
            data: error.data,
        })
    } else {
        return response.status(500).json({
            error: error?.message || "Internal server error",
        })
    }
}
