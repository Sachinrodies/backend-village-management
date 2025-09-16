import { ComplaintService } from '../services/complaintService.js';

export class ComplaintController {
  // Get all complaints
  static async getAllComplaints(req, res) {
    try {
      const complaints = await ComplaintService.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  }

  // Get complaint by ID
  static async getComplaintById(req, res) {
    const { id } = req.params;
    
    try {
      const complaint = await ComplaintService.getComplaintById(id);
      if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
      res.json(complaint);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      res.status(500).json({ error: 'Failed to fetch complaint' });
    }
  }

  // Create new complaint
  static async createComplaint(req, res) {
    const { PersonID, Description, PriorityLevel, LocationDescription, DepartmentID } = req.body;
    
    try {
      console.log('Creating complaint with data:', { PersonID, Description, PriorityLevel, LocationDescription, DepartmentID });
      const complaintId = await ComplaintService.createComplaint({ PersonID, Description, PriorityLevel, LocationDescription, DepartmentID });
      res.json({ success: true, message: 'Complaint created and assigned successfully', complaintId });
    } catch (error) {
      console.error('Error creating complaint:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to create complaint', details: error.message });
    }
  }

  // Update complaint status
  static async updateComplaintStatus(req, res) {
    const { id } = req.params;
    const { status, notes, officerId } = req.body;
    
    try {
      await ComplaintService.updateComplaintStatus({ id, status, notes, officerId });
      res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating complaint:', error);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  }

  // Get complaints by person
  static async getComplaintsByPerson(req, res) {
    const { personId } = req.params;
    
    try {
      const complaints = await ComplaintService.getComplaintsByPerson(personId);
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching person complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const stats = await ComplaintService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  // Assign complaint to officers
  static async assignComplaint(req, res) {
    const { id } = req.params;
    const { AssigningOfficerID, ResolvingOfficerID } = req.body;
    
    try {
      console.log(`Assigning complaint ${id} with AssigningOfficerID: ${AssigningOfficerID}, ResolvingOfficerID: ${ResolvingOfficerID}`);
      await ComplaintService.assignComplaint({ id, AssigningOfficerID, ResolvingOfficerID });
      res.json({ success: true, message: 'Complaint assigned successfully' });
    } catch (error) {
      console.error('Error assigning complaint:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to assign complaint', details: error.message });
    }
  }

  // Reset all complaint assignments (maintenance)
  static async resetAllAssignments(req, res) {
    try {
      const result = await ComplaintService.resetAllAssignments();
      res.json({ success: true, message: 'All assignments cleared; statuses reset to NEW', ...result });
    } catch (error) {
      console.error('Error resetting assignments:', error);
      res.status(500).json({ error: 'Failed to reset assignments' });
    }
  }

  // Get complaints by officer
  static async getComplaintsByOfficer(req, res) {
    const { officerId } = req.params;
    const { role } = req.query; // 'assigning' or 'resolving'
    
    try {
      const complaints = await ComplaintService.getComplaintsByOfficer({ officerId, role });
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching officer complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  }

  // Submit feedback for resolved complaint
  static async submitFeedback(req, res) {
    const { complaintId, personId, rating, comments } = req.body;
    
    try {
      await ComplaintService.submitFeedback({ complaintId, personId, rating, comments });
      res.json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }

  // Get feedback for complaint
  static async getComplaintFeedback(req, res) {
    const { id } = req.params;
    
    try {
      const feedback = await ComplaintService.getComplaintFeedback(id);
      res.json(feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  }

  // Get complaint logs
  static async getComplaintLogs(req, res) {
    const { id } = req.params;
    
    try {
      const logs = await ComplaintService.getComplaintLogs(id);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }

  // Add complaint update
  static async addComplaintUpdate(req, res) {
    const { id } = req.params;
    const { content, isPublic, createdBy } = req.body;
    
    try {
      await ComplaintService.addComplaintUpdate({ id, content, isPublic, createdBy });
      res.json({ success: true, message: 'Update added successfully' });
    } catch (error) {
      console.error('Error adding update:', error);
      res.status(500).json({ error: 'Failed to add update' });
    }
  }

  // Get complaint updates
  static async getComplaintUpdates(req, res) {
    const { id } = req.params;
    
    try {
      const updates = await ComplaintService.getComplaintUpdates(id);
      res.json(updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
      res.status(500).json({ error: 'Failed to fetch updates' });
    }
  }

  // Delete complaint and related data
  static async deleteComplaint(req, res) {
    const { id } = req.params;
    try {
      const result = await ComplaintService.deleteComplaint({ id });
      res.json({ success: true, message: 'Complaint deleted successfully', ...result });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Error deleting complaint:', error);
      res.status(500).json({ error: 'Failed to delete complaint' });
    }
  }

  // Transfer complaint to another department and reassign
  static async transferComplaintDepartment(req, res) {
    const { id } = req.params;
    const { targetDepartmentName, targetDepartmentId, ResolvingOfficerID } = req.body;
    try {
      const result = await ComplaintService.transferComplaintDepartment({ id, targetDepartmentName, targetDepartmentId, ResolvingOfficerID });
      res.json({ success: true, message: 'Complaint transferred successfully', ...result });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Error transferring complaint:', error);
      res.status(500).json({ error: 'Failed to transfer complaint' });
    }
  }

  // Delete test complaints by keyword(s)
  static async deleteTestComplaints(req, res) {
    const { keywords } = req.body; // optional array of strings
    try {
      const result = await ComplaintService.deleteTestComplaints({ keywords });
      res.json({ success: true, message: `Deleted ${result.deleted} test complaints`, ...result });
    } catch (error) {
      console.error('Error deleting test complaints:', error);
      res.status(500).json({ error: 'Failed to delete test complaints' });
    }
  }
}