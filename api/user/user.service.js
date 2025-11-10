import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { loggerService } from "../../services/logger.service.js"

export const userService = {
    query,
    getById,
    remove,
    save
}

const users = readJsonFile("./data/user.json")

async function query() {
    try {
        return users
    } catch (err) {
        loggerService.error("Couldn't get users", err)
        throw err
    }
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        if (!user) throw new Error("Cannot find user")
        return user
    } catch (err) {
        loggerService.error("Couldn't get user", err)
        throw err
    }
}

async function remove(userId) {
    try {
        const userIdx = users.find(user => user._id === userId)
        if (userIdx < 0) throw new Error("Cannot find user")
        users.splice(userIdx, 1)
        await _saveUsersToFile()
    } catch (err) {
        throw err
    }
}

async function save(userToSave) {
    try {
        if (userToSave._id) {
            const userIdx = users.findIndex(user => user._id === userToSave._id)
            if (userIdx < 0) throw new Error("Cannot find user")
            users[userIdx] = userToSave
        } else {
            userToSave._id = makeId()
            users.unshift(userToSave)
        }
        await _saveUsersToFile()
        return userToSave
    } catch (err) {
        loggerService.error("Couldn't save user", err)
        throw err
    }
}

function _saveUsersToFile() {
    return writeJsonFile("./data/user.json", users)
}