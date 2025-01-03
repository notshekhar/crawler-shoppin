import SqliteQueue from "./sqlite-queue"

const exampleQueue = new SqliteQueue<{
    exampleData: string
}>("example-queue", {
    maxAttempts: 5,
})

exampleQueue.add({
    exampleData: "example-success",
})
exampleQueue.add({
    exampleData: "example-fail",
})

console.log("Queue started")
exampleQueue.process(async (job, done) => {
    const data = job.data
    console.log(job.id)
    if (data.exampleData === "example-fail") {
        console.log("Failing job")
        done(new Error("Example error"))
    } else {
        console.log("Completing job")
        done()
    }
})

setTimeout(() => {
    exampleQueue.add({
        exampleData: "example-success-2",
    })
}, 20000)
