import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { bugService } from "./services/bug.service.js"
import { loggerService } from "./services/logger.service.js"
import { pdfService } from "./services/pdf.service.js"

const app = express()

//* ------------------- Config -------------------

const corsOptions = {
    origin: [
        "http://127.0.0.1:5173",
        "http://localhost:5173"
    ],
    credentials: true
}

app.use(cors(corsOptions))
app.use(cookieParser())

// ------------------- Bugs Crud -------------------

// Read/List
app.get("/api/bug", async (req, res) => {
    try {
        const bugs = await bugService.query()
        res.send(bugs)
    } catch (err) {
        loggerService.error("Couldn't get bugs", err)
        res.status(400).send("Couldn't get bugs")
    }
})

// Add/Update
app.get("/api/bug/save", async (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        severity: +req.query.severity
    }

    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error("Couldn't save bug", err)
        res.status(400).send("Couldn't save bug")
    }
})

// Download PDF
app.get("/api/bug/download", async (req, res) => {
    const bugs = await bugService.query()
    const pdf = pdfService.buildBugPDFStream(bugs)

    res.setHeader('Content-Type', 'application/pdf')

    pdf.pipe(res)
})

// Read
app.get("/api/bug/:bugId", async (req, res) => {
    const { bugId } = req.params
    try {
        const bug = await bugService.getById(bugId)
        res.send(bug)
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send("Couldn't get bug")
    }
})

// Delete
app.get("/api/bug/:bugId/remove", async (req, res) => {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send("Removed successfully")
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send("Couldn't remove bug")
    }
})

const port = 3030
app.listen(port, () => {
    loggerService.info(`App listening on port http://127.0.0.1:${port}`)
})