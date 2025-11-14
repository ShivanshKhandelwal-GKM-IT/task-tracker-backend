import { verifyToken } from "../helpers/jwt.js";
import { pool } from "../db/db.js";

export default async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);

    const result = await pool.query(
      "SELECT id, email FROM users WHERE id = $1 AND deleted_at IS NULL",
      [payload.id]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: "Invalid token" });

    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
