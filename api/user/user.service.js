import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { loggerService } from "../../services/logger.service.js"

export const userService = {
    query,
    getById,
    getByUsername,
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
        loggerService.error("userService[getById]:", err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const user = users.find(user => user.username === username)
        return user
    } catch (err) {
        loggerService("userService[getByUsername]:", err)
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
        loggerService.error("userService[remove]", err)
        throw err
    }
}

async function save(userToSave) {
    try {
        if (userToSave._id) {
            const userIdx = users.findIndex(user => user._id === userToSave._id)
            if (userIdx < 0) throw new Error("Cannot find user")
            const updatedUser = { ...users[userIdx], ...userToSave }
            users.splice(userIdx, 1, updatedUser)
            await _saveUsersToFile()
            return updatedUser
        } else {
            userToSave._id = makeId()
            userToSave.score = 10000
            userToSave.createdAt = Date.now()
            userToSave.isAdmin = false
            if (!userToSave.imgUrl) userToSave.imgUrl = "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
            users.unshift(userToSave)
        }
        await _saveUsersToFile()
        return userToSave
    } catch (err) {
        loggerService.error("userService[save]:", err)
        throw err
    }
}

function _saveUsersToFile() {
    return writeJsonFile("./data/user.json", users)
}