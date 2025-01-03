import express from "express"
import morgan from "morgan"
import cors from "cors"
import ejs from "ejs"

const app = express()

// Middlewares
app.use(morgan("dev"))
app.use(cors())

// Routes
app.get("/health", (req, res) => {
    res.send("Server is running")
})

// Listen
app.listen(4000, () => {
    console.log("Server on port", 4000)
})
