import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { loggerService } from "../../services/logger.service.js"
import { dbService } from "../../services/db.service.js"

export const bugService = {
    query,
    getById,
    save,
    remove,
}

// const bugs = readJsonFile("./data/bugs.json")
const PAGE_SIZE = 3

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const sort = _buildSort(filterBy)

        const collection = await dbService.getCollection("bug")
        var bugCursor = await collection.find(criteria, { sort })
        if (filterBy.pageIdx !== undefined) {
            bugCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }

        const bugs = await bugCursor.toArray()

        return bugs
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

async function remove(bugId, loggedinUser) {
    try {
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)

        if (bugIdx < 0) throw new Error("Cannot find bug")

        if (!loggedinUser.isAdmin && loggedinUser._id !== bugs[bugIdx].creator._id) throw ("Not your bug")

        bugs.splice(bugIdx, 1)
        await _saveBugsToFile()
    } catch (err) {
        loggerService.error(`Couldn't remove bug`)
        throw err
    }
}

async function save(bugToSave, loggedinUser) {
    try {
        if (bugToSave._id) {
            const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)

            if (bugIdx < 0) throw new Error("Cannot find bug")

            if (!loggedinUser.isAdmin && loggedinUser._id !== bugs[bugIdx].creator._id) throw ("Not your bug")

            const updatedBug = { ...bugs[bugIdx], ...bugToSave }
            bugs.splice(bugIdx, 1, updatedBug)
            await _saveBugsToFile()
            return updatedBug
        } else {
            bugToSave._id = makeId()
            bugToSave.createdAt = Date.now(),
                bugToSave.creator = {
                    _id: loggedinUser._id,
                    fullname: loggedinUser.fullname
                }
            bugs.unshift(bugToSave)
            await _saveBugsToFile()
            return bugToSave
        }
    } catch (err) {
        loggerService.error(`Couldn't save bug`, err);
        throw err
    }
}

// function _saveBugsToFile() {
//     return writeJsonFile("./data/bugs.json", bugs)
// }

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title, $options: "i" }
    }

    if (filterBy.severity) {
        criteria.severity = { $gte: filterBy.severity }
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        criteria.labels = { $all: filterBy.labels }
    }

    return criteria
}

function _buildSort(filterBy) {
    if (!filterBy.sortBy) return {}
    return {
        [filterBy.sortBy]: filterBy.sortDir
    }
}