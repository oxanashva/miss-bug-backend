import { authService } from "../api/auth/auth.service.js";

export function requireAdmin(req, res, next) {
    const loginToken = req.cookies.loginToken
    const loggedInUser = authService.validateToken(loginToken)

    if (!loggedInUser.isAdmin) return res.status(401).send("Access denied. Not an admin")

    next()
}