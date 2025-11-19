import express from "express"
import { getUsers, getUser, removeUser, updateUser, addUser } from "./user.controller.js"
import { requireAdmin } from "../../middlewares/reqiure-admin.middleware.js"

const router = express.Router()

router.get("/", getUsers)
router.get("/:userId", getUser)
router.delete("/:userId", requireAdmin, removeUser)
router.put("/:userId", requireAdmin, updateUser)
router.post("/", addUser)

export const userRoutes = router