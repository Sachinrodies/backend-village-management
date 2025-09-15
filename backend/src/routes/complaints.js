import { Router } from 'express';
import { db } from '../index.js';
import { validateComplaint } from '../middleware/validation.js';
import { ComplaintController } from '../controllers/complaintController.js';

export const complaintsRouter = Router();

// Get all complaints
complaintsRouter.get('/', ComplaintController.getAllComplaints);

// Get complaint by ID
complaintsRouter.get('/:id', ComplaintController.getComplaintById);

// Create new complaint
complaintsRouter.post('/', validateComplaint, ComplaintController.createComplaint);

// Update complaint status
complaintsRouter.put('/:id/status', ComplaintController.updateComplaintStatus);

// Get complaints by person
complaintsRouter.get('/person/:personId', ComplaintController.getComplaintsByPerson);

// Get dashboard statistics
complaintsRouter.get('/stats/dashboard', ComplaintController.getDashboardStats);

// Assign complaint to officers
complaintsRouter.post('/:id/assign', ComplaintController.assignComplaint);

// Get complaints by officer
complaintsRouter.get('/officer/:officerId', ComplaintController.getComplaintsByOfficer);

// Feedback routes
complaintsRouter.post('/:id/feedback', ComplaintController.submitFeedback);
complaintsRouter.get('/:id/feedback', ComplaintController.getComplaintFeedback);

// Log routes
complaintsRouter.get('/:id/logs', ComplaintController.getComplaintLogs);

// Updates routes
complaintsRouter.post('/:id/updates', ComplaintController.addComplaintUpdate);
complaintsRouter.get('/:id/updates', ComplaintController.getComplaintUpdates);