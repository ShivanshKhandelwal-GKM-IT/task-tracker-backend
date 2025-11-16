import { pool } from "../db/db.js";

export async function createTask(userId, taskData) {
  const { title, description, status_id, deadline } = taskData;
  
  const statusId = status_id ?? 1;

  const result = await pool.query(
    `INSERT INTO tasks (title, description, status_id, user_id, deadline)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [title, description, statusId, userId, deadline]
  );
  
  return result.rows[0];
}

export async function getTasksByUser(userId) {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 AND deleted_at IS NULL",
    [userId]
  );
  return result.rows;
}

export async function updateTask(userId, taskId, taskData) {
  const { title, description, status_id, deadline } = taskData;

  const statusId = status_id ?? 1;

  const result = await pool.query(
    `UPDATE tasks
     SET title=$1, description=$2, status_id=$3, deadline=$4, updated_at=NOW()
     WHERE id=$5 AND user_id=$6 AND deleted_at IS NULL
     RETURNING *`,
    [title, description, statusId, deadline, taskId, userId]
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

export async function deleteTask(userId, taskId) {
  await pool.query(
    "UPDATE tasks SET deleted_at = NOW() WHERE id=$1 AND user_id=$2",
    [taskId, userId]
  );
  return true;
}

export async function completeTask(userId, taskId) {
  
  const doneStatus = await pool.query(
    "SELECT id FROM status WHERE status_name = 'Completed'"
  );
  
  if (doneStatus.rows.length === 0) {
    throw new Error("Status 'Completed' not found in database");
  }

  const statusId = doneStatus.rows[0].id;

  const result = await pool.query(
    `UPDATE tasks SET completed_at = NOW(), status_id = $1 
     WHERE id = $2 AND user_id = $3 
     RETURNING *`,
    [statusId, taskId, userId]
  );

  if (result.rows.length === 0) return null;

  return result.rows[0];
}