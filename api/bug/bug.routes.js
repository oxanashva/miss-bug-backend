import express from "express"
import { getBugs, getBug, removeBug, updateBug, addBug, downloadBugs } from "./bug.controller.js"
import { requireAuth } from "../../middlewares/require-auth.middleware.js"

const router = express.Router()

router.get("/", getBugs)
router.get("/download", downloadBugs)
router.get("/:bugId", getBug)
router.delete("/:bugId", requireAuth, removeBug)
router.put("/:bugId", requireAuth, updateBug)
router.post("/", requireAuth, addBug)

export const bugRoutes = router