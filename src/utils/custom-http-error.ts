export default class CustomHttpError extends Error {
    status: number
    data: any
    constructor({
        message = "Internal server error",
        status = 500,
        data = null,
    }: {
        message: string
        status?: number
        data?: any
    }) {
        super(message)
        this.status = status
        this.data = data
    }
}
