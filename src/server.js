import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import { pool } from './db/db.js'; 
import authRoutes from './routes/auth-routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true, 
})); 
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`API is running. DB Time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("Database connection check failed:", err.message);
    res.status(503).send('Database connection failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };