import { readJsonFile, writeJsonFile, makeId } from "../../services/utils.js"
import { loggerService } from "../../services/logger.service.js"
import { dbService } from "../../services/db.service.js"
import { ObjectId } from "mongodb"


export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    save
}

const users = readJsonFile("./data/user.json")

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection("user")
        let users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            return user
        })
        return users
    } catch (err) {
        loggerService.error("Couldn't get users", err)
        throw err
    }
}

async function getById(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection("user")
        const user = await collection.findOne(criteria)
        user.createdAt = user._id.getTimestamp()
        delete user.password
        if (!user) throw new Error("Cannot find user")
        return user
    } catch (err) {
        loggerService.error("userService[getById]:", err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection("user")
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        loggerService("userService[getByUsername]:", err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }
        const collection = await dbService.getCollection("user")
        await collection.deleteOne(criteria)
    } catch (err) {
        loggerService.error("userService[remove]", err)
        throw err
    }
}

async function save(userToSave) {
    let savedUser
    try {
        const collection = await dbService.getCollection("user")

        if (userToSave._id) {
            const userId = ObjectId.createFromHexString(userToSave._id)
            const userToUpdate = { ...userToSave }
            delete userToUpdate._id

            const result = await collection.findOneAndUpdate({ _id: userId }, { $set: userToUpdate }, { returnDocument: "after" })

            if (!result) throw new Error("Cannot find user")

            savedUser = result
        } else {
            const newUser = {
                ...userToSave,
                score: 10000,
                isAdmin: false,
                imgUrl: userToSave.imgUrl || "https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png"
            }

            const result = await collection.insertOne(newUser)
            savedUser = { ...newUser, _id: result.insertedId }

        }

        savedUser.createdAt = savedUser._id.getTimestamp()
        delete savedUser.password
        return savedUser
    } catch (err) {
        loggerService.error("userService[save]:", err)
        throw err
    }
}

// function _saveUsersToFile() {
//     return writeJsonFile("./data/user.json", users)
// }

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: "i" }
        criteria.$or = [
            { username: txtCriteria },
            { fullname: txtCriteria }
        ]
    }
    if (filterBy.minScore) {
        criteria.score = { $gte: filterBy.minScore }
    }

    return criteria
}