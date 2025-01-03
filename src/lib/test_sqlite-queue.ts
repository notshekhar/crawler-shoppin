import SqliteQueue from "./sqlite-queue"

const exampleQueue = new SqliteQueue<{
    exampleData: string
}>("example-queue", {
    maxAttempts: 5,
})

exampleQueue.add({
    exampleData: "example-success-1",
})
exampleQueue.add({
    exampleData: "example-success-2",
})
exampleQueue.add({
    exampleData: "example-fail",
})

console.log("Queue started")
exampleQueue.process(async (job, done) => {
    const data = job.data
    if (data.exampleData === "example-fail") {
        console.log("Failing job", job.id)
        done(new Error("Example error"))
    } else {
        console.log("Completing job", job.id)
        done()
    }
}, 3)

setTimeout(() => {
    exampleQueue.add({
        exampleData: "example-success-3",
    })
}, 20000)
