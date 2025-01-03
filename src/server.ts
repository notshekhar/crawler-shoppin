import express from "express"
import morgan from "morgan"
import cors from "cors"
import path from "path"
import ErrorHandler from "./middlewares/ErrorHandler"
import { init_db } from "./init_db"
import {
    addWebsite,
    getAllWebsites,
} from "./controllers/add-website.controller"

const app = express()

// Middlewares
app.use(morgan("dev"))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set("view engine", "ejs")

// Static files
app.use(express.static(path.join(__dirname, "../public")))

// Routes
app.get("/health", (request, response) => {
    response.send("Server is running")
})

app.get("/websites", getAllWebsites)
app.post("/websites", addWebsite)

// @ts-ignore
app.use(ErrorHandler)

// Listen
app.listen(4001, async () => {
    console.log("Initializing database")
    await init_db()
    console.log("Database initialized")
    console.log("Server on port", 4001)
})
