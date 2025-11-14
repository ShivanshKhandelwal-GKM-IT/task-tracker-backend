import express from "express";
import auth from "../middlewares/auth-middleware.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
} from "../controllers/task-controller.js";

const router = express.Router();

router.use(auth);

router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/complete", completeTask);

export default router;
