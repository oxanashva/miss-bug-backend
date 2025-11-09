import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { loggerService } from "../../services/logger.service.js"

export const bugService = {
    query,
    getById,
    save,
    remove,
}

const bugs = readJsonFile("./data/bugs.json")
const PAGE_SIZE = 3

async function query(filterBy = {}, sortBy = '', sortDir = 1) {
    let bugsToDisplay = bugs
    try {
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, "i")
            bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))
        }

        if (filterBy.severity) {
            bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.severity)
        }

        if (filterBy.labels && filterBy.labels.length > 0) {
            bugsToDisplay = bugsToDisplay.filter(bug => {
                return bug.labels.some(label => filterBy.labels.includes(label))
            })
        }

        if (sortBy === "title") {
            bugsToDisplay = bugsToDisplay.sort((a, b) => {
                return a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            })
        }

        if (sortBy === "severity") {
            bugsToDisplay = bugsToDisplay.sort((a, b) => {
                return a.severity - b.severity
            }) // asc
        }

        if (sortBy === "createdAt") {
            if (sortDir === -1) { // desc
                bugsToDisplay = bugsToDisplay.sort((a, b) => {
                    return b.createdAt - a.createdAt
                })
            } else { // asc
                bugsToDisplay = bugsToDisplay.sort((a, b) => {
                    return a.createdAt - b.createdAt
                })
            }
        }

        if ("pageIdx" in filterBy) {
            const startIdx = filterBy.pageIdx * PAGE_SIZE
            bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
        }

        return bugsToDisplay
    } catch (err) {
        loggerService.error(`Couldn't get bugs`, err)
        throw err
    }
}

async function getById(bugId) {
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        if (!bug) throw new Error("Cannot find bug")
        return bug
    } catch (err) {
        loggerService.error(`Couldn't get bug`, err)
        throw err
    }
}

async function remove(bugId) {
    try {
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        if (bugIdx < 0) throw new Error("Cannot find bug")
        bugs.splice(bugIdx, 1)
        await _saveBugsToFile()
    } catch (err) {
        loggerService.error(`Couldn't remove bug`)
        throw err
    }
}

async function save(bugToSave) {
    try {
        if (bugToSave._id) {
            const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (bugIdx < 0) throw new Error("Cannot find bug")
            bugs[bugIdx] = bugToSave
        } else {
            bugToSave._id = makeId()
            bugs.unshift(bugToSave)
        }
        await _saveBugsToFile()
        return bugToSave
    } catch (err) {
        loggerService.error(`Couldn't save bug`, err);
        throw err
    }
}

function _saveBugsToFile() {
    return writeJsonFile("./data/bugs.json", bugs)
}