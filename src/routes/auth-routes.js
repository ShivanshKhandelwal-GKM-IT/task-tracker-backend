import express from "express";
import auth from "../middlewares/auth-middleware.js"; 
import { register, login, logout, me } from "../controllers/auth-controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", auth, me); 

export default router;