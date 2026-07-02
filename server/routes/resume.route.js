import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  parseResume,
  improveContent,
  generateSummary,
  getMyResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

// Parse existing resume (upload PDF)
resumeRouter.post("/parse", isAuth, upload.single("resume"), parseResume);

// AI improvements
resumeRouter.post("/improve", isAuth, improveContent);
resumeRouter.post("/generate-summary", isAuth, generateSummary);

// CRUD operations
resumeRouter.get("/", isAuth, getMyResumes);
resumeRouter.get("/:id", isAuth, getResume);
resumeRouter.post("/", isAuth, createResume);
resumeRouter.put("/:id", isAuth, updateResume);
resumeRouter.delete("/:id", isAuth, deleteResume);
resumeRouter.post("/:id/duplicate", isAuth, duplicateResume);

export default resumeRouter;

