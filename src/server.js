import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { pool } from './db/db.js'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); 
    res.send(`API is running. DB Time: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send('Database connection failed');
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app };