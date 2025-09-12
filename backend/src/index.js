import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createConnectionPool } from './lib/db.js';
import { registerHealthRoute } from './routes/health.js';
import { personsRouter } from './routes/persons.js';
import { complaintsRouter } from './routes/complaints.js';
import { departmentsRouter } from './routes/departments.js';
import { villagesRouter } from './routes/villages.js';
import { assigningOfficersRouter } from './routes/assigning-officers.js';
import { resolvingOfficersRouter } from './routes/resolving-officers.js';
import { complaintAssignmentsRouter } from './routes/complaint-assignments.js';
import { complaintLogsRouter } from './routes/complaint-logs.js';
import { feedbackRouter } from './routes/feedback.js';
import { workflowRouter } from './routes/workflow.js';
import { authRouter } from './routes/auth.js';
import { errorHandler, notFound } from './middleware/validation.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

export const db = createConnectionPool();

// Health check
registerHealthRoute(app);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/persons', personsRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/villages', villagesRouter);
app.use('/api/assigning-officers', assigningOfficersRouter);
app.use('/api/resolving-officers', resolvingOfficersRouter);
app.use('/api/complaint-assignments', complaintAssignmentsRouter);
app.use('/api/complaint-logs', complaintLogsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/workflow', workflowRouter);


// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});


