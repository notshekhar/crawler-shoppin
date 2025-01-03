declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "staging"
            IS_LOCAL: string

            PORT: string
        }
    }
}
export {}
