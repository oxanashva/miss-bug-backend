import { userService } from "./user.service.js"
import { loggerService } from "../../services/logger.service.js"

// ------------------- User CRUD -------------------

// Read/List
export async function getUsers(req, res) {
    try {
        const users = await userService.query()
        res.send(users)
    } catch (err) {
        loggerService.error("Couldn't get users", err)
        res.status(400).send("Couldn't get users")
    }
}

// Read/Item
export async function getUser(req, res) {
    try {
        const { userId } = req.params
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(`Couldn't get user ${userId}`, err)
        res.status(400).send("Couldn't get user")
    }
}

// Delete
export async function removeUser(req, res) {
    try {
        const { userId } = req.params
        await userService.remove(userId)
        res.send("Removed successfully")
    } catch (err) {
        loggerService.error(`Couldn't remove user ${userId}`, err)
        res.status(400).send("Couldn't remove user")
    }
}

// Update
export async function updateUser(req, res) {
    const { _id, fullname, username, password, score } = req.body
    const userToSave = {
        _id,
        fullname,
        username,
        password,
        score
    }

    try {
        await userService.save(userToSave)
        res.send(userToSave)
    } catch (err) {
        loggerService.error("Couldn't save user", err)
        res.status(400).send("Couldn't save user")
    }
}

// Add
export async function addUser(req, res) {
    const { _id, fullname, username, password, score } = req.body
    const userToSave = {
        _id,
        fullname,
        username,
        password,
        score
    }

    try {
        await userService.save(userToSave)
        res.send(userToSave)
    } catch (err) {
        loggerService.error("Couldn't save user", err)
        res.status(400).send("Couldn't save user")
    }
}