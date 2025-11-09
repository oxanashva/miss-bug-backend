import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { loggerService } from "./services/logger.service.js"

const app = express()

//* ------------------- Config -------------------

const corsOptions = {
    origin: [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174"
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.static("public"))
app.set("query parser", "extended")

import { bugRoutes } from './api/bug/bug.routes.js'
app.use('/api/bug', bugRoutes)

const port = 3030
app.listen(port, () => {
    loggerService.info(`App listening on port http://127.0.0.1:${port}`)
})