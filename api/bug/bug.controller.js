import { bugService } from "./bug.service.js"
import { loggerService } from "../../services/logger.service.js"
import { pdfService } from "../../services/pdf.service.js"
import { authService } from "../auth/auth.service.js"

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

// ------------------- Bugs Crud -------------------

// Read/List
export async function getBugs(req, res) {
    const { title, severity, labels, pageIdx, sortBy, sortDir } = req.query
    const filterBy = {
        title,
        severity: +severity,
        labels,
        sortBy,
        sortDir,
        pageIdx
    }

    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (err) {
        loggerService.error("Couldn't get bugs", err)
        res.status(400).send("Couldn't get bugs")
    }
}

// Read/Item
export async function getBug(req, res) {
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
}

// Delete
export async function removeBug(req, res) {
    const { bugId } = req.params
    const loggedinUser = req.loggwedInUser

    try {
        await bugService.remove(bugId, loggedinUser)
        res.send("Removed successfully")
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send("Couldn't remove bug")
    }
}

// Update
export async function updateBug(req, res) {
    const { _id, severity, description } = req.body
    const bugToSave = {
        _id,
        severity,
        description,
    }
    const loggedinUser = req.loggwedInUser

    try {
        const savedBug = await bugService.save(bugToSave, loggedinUser)
        res.send(savedBug)
    } catch (err) {
        loggerService.error("Couldn't save bug", err)
        res.status(400).send("Couldn't save bug")
    }
}

// Add
export async function addBug(req, res) {
    const { title, severity, description } = req.body
    const bugToSave = {
        title,
        severity,
        description,
    }
    const loggedinUser = req.loggwedInUser

    try {
        const savedBug = await bugService.save(bugToSave, loggedinUser)
        res.send(savedBug)
    } catch (err) {
        loggerService.error("Couldn't save bug", err)
        res.status(400).send("Couldn't save bug")
    }
}

// Download PDF
export async function downloadBugs(req, res) {
    const bugs = await bugService.query()
    const pdf = pdfService.buildBugPDFStream(bugs)

    res.setHeader('Content-Type', 'application/pdf')

    pdf.pipe(res)
}