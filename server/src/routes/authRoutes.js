import express from "express";
import {
  getCurrentUser,
  githubCallback,
  githubLogin,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
