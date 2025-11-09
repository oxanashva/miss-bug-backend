import express from "express"
import { getBugs, getBug, removeBug, updateBug, addBug, downloadBugs } from "./bug.controller.js"

const router = express.Router()

router.get("/", getBugs)
router.get("/download", downloadBugs)
router.get("/:bugId", getBug)
router.delete("/:bugId", removeBug)
router.put("/:bugId", updateBug)
router.post("/", addBug)

export const bugRoutes = router