import * as taskService from "../services/task-service.js";

export async function createTask(req, res) {
  try {
    
    const task = await taskService.createTask(req.user.id, req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getTasks(req, res) {
  try {
    const tasks = await taskService.getTasksByUser(req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateTask(req, res) {
  try {
    const updatedTask = await taskService.updateTask(
      req.user.id,
      req.params.id,
      req.body
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteTask(req, res) {
  try {
    await taskService.deleteTask(req.user.id, req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function completeTask(req, res) {
  try {
    const completedTask = await taskService.completeTask(
      req.user.id,
      req.params.id
    );

    if (!completedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(completedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}