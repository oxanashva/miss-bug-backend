import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import { bugService } from "./services/bug.service.js"
import { loggerService } from "./services/logger.service.js"
import { pdfService } from "./services/pdf.service.js"

const app = express()
const COOKIE_NAME = 'visitedBugs'

function getVisitedBugs(req) {
    const visitedBugs = req.cookies[COOKIE_NAME]
    if (visitedBugs) {
        try {
            return JSON.parse(visitedBugs)
        } catch (err) {
            console.error('Error parsing visitedBugs cookie:', err)
            return []
        }
    }
    return []
}

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
    const { title, severity, labels, pageIdx, sortBy } = req.query
    const filterBy = {
        title,
        severity: +severity,
        labels,
    }

    if (pageIdx) filterBy.pageIdx = +pageIdx
    const sortDir = req.query.sortDir ? +req.query.sortDir : undefined

    try {
        const bugs = await bugService.query(filterBy, sortBy, sortDir)
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
        severity: +req.query.severity,
        description: req.query.description,
        createdAt: +req.query.createdAt
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
    let visitedBugs = getVisitedBugs(req)
    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    console.log(`User visited the following bugs: [${visitedBugs.join(', ')}]`)

    if (visitedBugs.length > 3) {
        return res.status(401).send("Wait for a bit")
    }

    res.cookie(COOKIE_NAME, JSON.stringify(visitedBugs), { maxAge: 7000, httpOnly: true })

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