import bcrypt from "bcryptjs";
import { pool } from "../db/db.js";
import { signToken } from "../helpers/jwt.js";

export async function registerUser(email, password, name) {
  
  const userExists = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
    [email]
  );
  
  if (userExists.rows.length > 0) {
    throw new Error("Email already exists"); 
  }

  
  const hashed = await bcrypt.hash(password, 10);

  
  const result = await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3) RETURNING id, email, name`,
    [email, hashed, name]
  );

  const user = result.rows[0];
  
  
  const token = signToken({ id: user.id });

  
  return { user, token };
}

export async function loginUser(email, password) {
 
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
    [email]
  );

  const user = result.rows[0];
  
  
  if (!user) throw new Error("Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  
  const token = signToken({ id: user.id });

  
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
}