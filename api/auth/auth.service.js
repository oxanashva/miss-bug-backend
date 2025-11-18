import Cryptr from "cryptr"
import bcrypt from "bcrypt"

import { userService } from "../user/user.service.js"
import { loggerService } from "../../services/logger.service.js"

const crypt = new Cryptr(process.env.SECRET_KEY)

export const authService = {
    getLoginToken,
    validateToken,
    login,
    signup
}

function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = crypt.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    try {
        const json = crypt.decrypt(token)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        loggerService.error("Invalid login token", err)
        return null
    }
}

async function login(username, password) {
    const user = await userService.getByUsername(username)
    if (!user) throw new Error("Invalid username or password")
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new Error("Invalid username or passwordt")

    const miniUser = {
        _id: user._id,
        fullname: user.fullname,
        imgUrl: user.imgUrl,
        score: user.score,
        isAdmin: user.isAdmin
    }
    return miniUser
}

async function signup({ username, password, fullname }) {
    const saltRounds = 10

    loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)

    if (!username || !password || !fullname) throw "Missing required signup information"

    const userExists = await userService.getByUsername(username)
    if (userExists) throw "Username already taken"

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.save({ username, password: hash, fullname })
}