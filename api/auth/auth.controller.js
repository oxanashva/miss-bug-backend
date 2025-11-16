import { authService } from "./auth.service.js"
import { loggerService } from "../../services/logger.service.js"

export async function login(req, res) {
    const { username, password } = req.body

    try {
        const user = await authService.login(username, password)
        loggerService.info("User login:", user)

        const loginToken = authService.getLoginToken(user)
        res.cookie("loginToken", loginToken, { sameSite: "None", secure: true, httpOnly: true })
        res.json(user)
    } catch (err) {
        loggerService.error("Failed to login", err)
        res.status(401).send({ err: "Failed to login" })
    }
}

export async function signup(req, res) {
    try {
        const crednetials = req.body

        const account = await authService.signup(crednetials)
        loggerService.debug(`auth.controller - new account created: ${JSON.stringify(account)}`)

        const user = await authService.login(crednetials.username, crednetials.password)
        loggerService.info("User signup:", user)

        const loginToken = authService.getLoginToken(user)
        res.cookie("loginToken", loginToken, { sameSite: "None", secure: true, httpOnly: true })
        res.json(user)
    } catch (err) {
        loggerService.error("Failed to signup", err)
        res.status(401).send({ err: "Failed to signup" })
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie("loginToken")
        res.send({ msg: "Logged Out successfully" })
    } catch (err) {
        res.status(401).send({ err: "Failed to logout" })
    }
}