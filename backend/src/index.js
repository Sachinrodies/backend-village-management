import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createConnectionPool } from './lib/db.js';
import { personsRouter } from './routes/persons.js';
import { complaintsRouter } from './routes/complaints.js';
import { departmentsRouter } from './routes/departments.js';
import { villagesRouter } from './routes/villages.js';
import { authRouter } from './routes/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

export const db = createConnectionPool();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/persons', personsRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/villages', villagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
});