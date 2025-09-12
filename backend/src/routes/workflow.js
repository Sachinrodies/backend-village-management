import { Router } from 'express';
import { ComplaintController } from '../controllers/complaintController.js';
import { validateStatusUpdate, validateAssignment, validatePagination } from '../middleware/validation.js';

export const workflowRouter = Router();

// Get complaint workflow status
workflowRouter.get('/complaint/:id/status', async (req, res) => {
  try {
    const workflowStatus = await ComplaintController.getWorkflowStatus(req.params.id);
    res.json(workflowStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process workflow action
workflowRouter.post('/complaint/:id/action/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const result = await ComplaintController.processWorkflow(req.params.id, action, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard data for user role
workflowRouter.get('/dashboard/:userRole/:userId', validatePagination, async (req, res) => {
  try {
    const { userRole, userId } = req.params;
    const filters = {
      status: req.query.status,
      department: req.query.department,
      district: req.query.district,
      block: req.query.block,
      ...req.pagination
    };
    
    const dashboardData = await ComplaintController.getDashboardData(userRole, userId, filters);
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign complaint (with validation)
workflowRouter.post('/complaint/:id/assign', validateAssignment, async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'assign', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept assignment
workflowRouter.post('/complaint/:id/accept', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'accept_assignment', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject assignment
workflowRouter.post('/complaint/:id/reject-assignment', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'reject_assignment', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start work
workflowRouter.post('/complaint/:id/start-work', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'start_work', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update progress
workflowRouter.post('/complaint/:id/progress', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'update_progress', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve complaint
workflowRouter.post('/complaint/:id/resolve', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'resolve', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject complaint
workflowRouter.post('/complaint/:id/reject', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'reject', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close complaint
workflowRouter.post('/complaint/:id/close', async (req, res) => {
  try {
    const result = await ComplaintController.processWorkflow(req.params.id, 'close', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workflow statistics
workflowRouter.get('/stats', async (req, res) => {
  try {
    const { userRole, userId } = req.query;
    const dashboardData = await ComplaintController.getDashboardData(userRole, userId);
    res.json(dashboardData.statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
