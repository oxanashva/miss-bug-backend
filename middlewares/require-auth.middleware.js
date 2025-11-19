import { authService } from "../api/auth/auth.service.js"

export function requireAuth(req, res, next) {
    const loginToken = req.cookies.loginToken
    const loggedInUser = authService.validateToken(loginToken)

    if (!loggedInUser) return res.status(401).send("Access denied. Log in first")
    req.loggwedInUser = loggedInUser

    next()
}