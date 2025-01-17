import { QueryTypes, Sequelize, Transaction } from "sequelize"

type JobStatus = "pending" | "active" | "completed" | "failed" | "stalled"

export interface JobAttributes<T> {
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
        this.pollingInterval = 5
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

    private async getNextNJob(n: number): Promise<JobAttributes<T>[]> {
        const jobs = (await this.sequelize.query(
            `
                SELECT *
                FROM jobs
                WHERE status in ('pending', 'failed') AND attempts < :maxAttempts
                ORDER BY attempts ASC
                LIMIT :n;
            `,
            {
                replacements: {
                    maxAttempts: this.maxAttempts,
                    n,
                },
                type: QueryTypes.SELECT,
            }
        )) as JobAttributes<string>[]

        const data = jobs.map((job) => {
            return { ...job, data: JSON.parse(job.data) as T }
        })
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
            await this.markJobActive(job.id)
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
    private async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async process(
        processor: (job: JobAttributes<T>, cb: (error?: Error) => void) => void,
        concurrency: number = 1
    ): Promise<void> {
        if (concurrency <= 0) {
            throw new Error("Concurrency must be positive")
        }
        await this.sleep(2000)

        while (true) {
            try {
                const jobs = await this.getNextNJob(concurrency)
                if (jobs.length === 0) {
                    await this.sleep(this.pollingInterval)
                    continue
                }
                await Promise.all(
                    jobs.map((job) => this.processJob(job, processor))
                )
                await this.sleep(this.pollingInterval)
            } catch (error) {
                console.error("Worker error:", error)
                await this.sleep(this.pollingInterval)
            }
        }
    }
}
