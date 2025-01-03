import { QueryTypes, Sequelize, Transaction } from "sequelize"

type JobStatus = "pending" | "active" | "completed" | "failed" | "stalled"

interface JobAttributes<T> {
    id: number
    status: JobStatus
    data: T
    attempts: number
    created_at: Date
    updated_at: Date
    started_at?: Date
    completed_at?: Date
    error?: string
}

interface SqliteQueueOptions {
    maxAttempts?: number
    pollingInterval?: number
}

export default class SqliteQueue<T> {
    private sequelize: Sequelize
    private maxAttempts: number
    private pollingInterval: number

    constructor(queueName: string, options: SqliteQueueOptions = {}) {
        this.maxAttempts = 3
        this.pollingInterval = 100
        this.sequelize = new Sequelize({
            dialect: "sqlite",
            storage: `${queueName}.sqlite`,
            logging: false,
        })
        this.init(options)
    }
    private setPollingInterval(pollingInterval?: number) {
        if (pollingInterval && pollingInterval < 1) {
            throw new Error("pollingInterval must be a positive integer")
        }
        this.pollingInterval = pollingInterval || 1000
    }
    private setMaxAttempts(maxAttempts?: number) {
        if (maxAttempts && maxAttempts < 1) {
            throw new Error("maxAttempts must be a positive integer")
        }
        this.maxAttempts = maxAttempts || 3
    }
    private async createJobTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                status TEXT NOT NULL DEFAULT 'pending',
                data JSON NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                error TEXT DEFAULT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                started_at DATETIME,
                completed_at DATETIME
            );
        `
        await this.sequelize.query(query)
    }
    private async createUpdateTrigger() {
        const update_jobs_updated_at_trigger = `
            CREATE TRIGGER IF NOT EXISTS update_jobs_updated_at
            AFTER UPDATE ON jobs
            BEGIN
                UPDATE jobs
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = OLD.id;
            END;
        `
        await this.sequelize.query(update_jobs_updated_at_trigger)
    }
    private async init(options: SqliteQueueOptions = {}) {
        await this.createJobTable()
        await this.createUpdateTrigger()
        this.setMaxAttempts(options.maxAttempts)
        this.setPollingInterval(options.pollingInterval)
    }

    async add(data: T): Promise<number> {
        const transaction = await this.sequelize.transaction()
        try {
            const query = `
                INSERT INTO jobs (data)
                VALUES (:data);
            `
            const [jobId] = await this.sequelize.query(query, {
                replacements: { data: JSON.stringify(data) },
                type: QueryTypes.INSERT,
            })
            await transaction.commit()
            return jobId
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    private async getNextJob(): Promise<JobAttributes<T> | null> {
        const job = (await this.sequelize.query(
            `
                SELECT *
                FROM jobs
                WHERE status in ('pending', 'failed') AND attempts < :maxAttempts 
                ORDER BY attempts ASC
                LIMIT 1;
            `,
            {
                replacements: {
                    maxAttempts: this.maxAttempts,
                },
                type: QueryTypes.SELECT,
            }
        )) as JobAttributes<string>[]
        if (job.length === 0) {
            return null
        }
        const data = { ...job[0], data: JSON.parse(job[0].data) as T }
        return data
    }

    private async markJobActive(jobId: number): Promise<void> {
        await this.sequelize.query(
            `
                UPDATE jobs
                SET status = 'active',
                    attempts = attempts + 1
                WHERE id = :id;
            `,
            {
                replacements: { id: jobId },
                type: QueryTypes.UPDATE,
            }
        )
    }

    private async markJobCompleted(jobId: number): Promise<void> {
        await this.sequelize.query(
            `
                UPDATE jobs
                SET status = 'completed'
                WHERE id = :id;
            `,
            { replacements: { id: jobId }, type: QueryTypes.UPDATE }
        )
    }

    private async markJobFailed(jobId: number, error: Error): Promise<void> {
        await this.sequelize.query(
            `
                UPDATE jobs
                SET status = 'failed', error = :error
                WHERE id = :id;
            `,
            {
                replacements: { error: error.message, id: jobId },
                type: QueryTypes.UPDATE,
            }
        )
    }

    private async processJob(
        job: JobAttributes<T>,
        processor: (data: JobAttributes<T>, cb: (error?: Error) => void) => void
    ): Promise<void> {
        try {
            await processor(job, async (error) => {
                try {
                    if (error) {
                        await this.markJobFailed(job.id, error)
                    } else {
                        await this.markJobCompleted(job.id)
                    }
                } catch (updateError) {
                    console.error("Error updating job status:", updateError)
                }
            })
        } catch (processError) {
            console.error("Error processing job:", processError)
            try {
                await this.markJobFailed(job.id, processError as Error) // Mark as failed if processing itself throws
            } catch (updateError) {
                console.error(
                    "Error updating job status after processing error:",
                    updateError
                )
            }
        }
    }

    async process(
        processor: (job: JobAttributes<T>, cb: (error?: Error) => void) => void
    ): Promise<void> {
        const concurrency = 1
        if (concurrency <= 0) {
            throw new Error("Concurrency must be positive")
        }

        const worker = async () => {
            while (true) {
                try {
                    const job = await this.getNextJob()
                    if (!job) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, this.pollingInterval)
                        )
                        continue
                    }
                    await this.markJobActive(job.id)
                    await this.processJob(job, processor)
                    await new Promise((resolve) =>
                        setTimeout(resolve, this.pollingInterval)
                    )
                } catch (error) {
                    console.error("Worker error:", error)
                    await new Promise((resolve) =>
                        setTimeout(resolve, this.pollingInterval)
                    )
                }
            }
        }

        const workers = Array(concurrency)
            .fill(null)
            .map(() => worker())
        await Promise.all(workers)
    }
}
