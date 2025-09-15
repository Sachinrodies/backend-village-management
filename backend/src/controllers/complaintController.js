import { db } from '../index.js';

export class ComplaintController {
  // Get all complaints
  static async getAllComplaints(req, res) {
    try {
      const [complaints] = await db.query(`
        SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName,
               ca.AssigningOfficerID, ca.ResolvingOfficerID, ca.AssignmentTimestamp,
               ao.FirstName as AssigningOfficerName, ao.LastName as AssigningOfficerLastName,
               ro.FirstName as ResolvingOfficerName, ro.LastName as ResolvingOfficerLastName
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
        LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
        LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
        ORDER BY c.ComplaintID DESC
      `);
      
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
      const [complaints] = await db.query(`
        SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        WHERE c.ComplaintID = ?
      `, [id]);
      
      if (complaints.length === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      
      res.json(complaints[0]);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      res.status(500).json({ error: 'Failed to fetch complaint' });
    }
  }

  // Create new complaint
  static async createComplaint(req, res) {
    const { PersonID, Description, PriorityLevel, LocationDescription, DepartmentID } = req.body;
    
    try {
      // Create complaint
      const [result] = await db.query(`
        INSERT INTO Complaint (PersonID, Description, PriorityLevel, LocationDescription, Status, Timestamp, DepartmentID)
        VALUES (?, ?, ?, ?, 'NEW', NOW(), ?)
      `, [PersonID, Description, PriorityLevel || 'MEDIUM', LocationDescription || '', DepartmentID || 1]);
      
      const complaintId = result.insertId;
      
      // Auto-assign to officers if department specified
      if (DepartmentID) {
        // Find assigning officer for this department
        const [assigningOfficers] = await db.query(`
          SELECT AssigningOfficerID FROM AssigningOfficer 
          WHERE DepartmentID = ? AND IsActive = 1 
          ORDER BY RAND() LIMIT 1
        `, [DepartmentID]);
        
        // Find resolving officer for this department
        const [resolvingOfficers] = await db.query(`
          SELECT ResolvingOfficerID FROM ResolvingOfficer 
          WHERE DepartmentID = ? AND IsActive = 1 
          ORDER BY RAND() LIMIT 1
        `, [DepartmentID]);
        
        if (assigningOfficers.length > 0 && resolvingOfficers.length > 0) {
          // Create assignment
          await db.query(`
            INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp)
            VALUES (?, ?, ?, NOW())
          `, [complaintId, assigningOfficers[0].AssigningOfficerID, resolvingOfficers[0].ResolvingOfficerID]);
          
          // Update complaint status
          await db.query(`
            UPDATE Complaint SET Status = 'ASSIGNED' WHERE ComplaintID = ?
          `, [complaintId]);
        }
      }
      
      res.json({ 
        success: true, 
        message: 'Complaint created and assigned successfully',
        complaintId: complaintId 
      });
    } catch (error) {
      console.error('Error creating complaint:', error);
      res.status(500).json({ error: 'Failed to create complaint' });
    }
  }

  // Update complaint status
  static async updateComplaintStatus(req, res) {
    const { id } = req.params;
    const { status, notes, officerId } = req.body;
    
    try {
      await db.query(`
        UPDATE Complaint 
        SET Status = ?
        WHERE ComplaintID = ?
      `, [status, id]);
      
      // Log the status change
      await db.query(`
        INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription)
        VALUES (?, ?, ?, NOW(), ?)
      `, [id, status, officerId || 1, notes || `Status changed to ${status}`]);
      
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
      const [complaints] = await db.query(`
        SELECT c.*, d.DepartmentName, v.VillageName
        FROM Complaint c
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        WHERE c.PersonID = ?
        ORDER BY c.ComplaintID DESC
      `, [personId]);
      
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching person complaints:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as totalComplaints,
          SUM(CASE WHEN Status = 'NEW' THEN 1 ELSE 0 END) as newComplaints,
          SUM(CASE WHEN Status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedComplaints,
          SUM(CASE WHEN Status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressComplaints,
          SUM(CASE WHEN Status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedComplaints,
          SUM(CASE WHEN Status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedComplaints
        FROM Complaint
      `);
      
      res.json(stats[0]);
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
      // Create assignment
      await db.query(`
        INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp)
        VALUES (?, ?, ?, NOW())
      `, [id, AssigningOfficerID, ResolvingOfficerID]);
      
      // Update complaint status
      await db.query(`
        UPDATE Complaint SET Status = 'ASSIGNED' WHERE ComplaintID = ?
      `, [id]);
      
      res.json({ success: true, message: 'Complaint assigned successfully' });
    } catch (error) {
      console.error('Error assigning complaint:', error);
      res.status(500).json({ error: 'Failed to assign complaint' });
    }
  }

  // Get complaints by officer
  static async getComplaintsByOfficer(req, res) {
    const { officerId } = req.params;
    const { role } = req.query; // 'assigning' or 'resolving'
    
    try {
      let query = `
        SELECT c.*, p.FirstName, p.LastName, p.PhoneNumber, d.DepartmentName, v.VillageName
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
        WHERE `;
      
      if (role === 'assigning') {
        query += `ca.AssigningOfficerID = ?`;
      } else {
        query += `ca.ResolvingOfficerID = ?`;
      }
      
      query += ` ORDER BY c.ComplaintID DESC`;
      
      const [complaints] = await db.query(query, [officerId]);
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
      // Check if complaint exists and is resolved
      const [complaints] = await db.query(
        'SELECT Status FROM Complaint WHERE ComplaintID = ?',
        [complaintId]
      );
      
      if (complaints.length === 0) {
        return res.status(404).json({ error: 'Complaint not found' });
      }
      
      if (complaints[0].Status !== 'RESOLVED') {
        return res.status(400).json({ error: 'Complaint must be resolved before feedback' });
      }
      
      // Insert feedback
      await db.query(`
        INSERT INTO Feedback (ComplaintID, PersonID, Rating, Comments, FeedbackTimestamp)
        VALUES (?, ?, ?, ?, NOW())
      `, [complaintId, personId, rating, comments || '']);
      
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
      const [feedback] = await db.query(`
        SELECT f.*, p.FirstName, p.LastName
        FROM Feedback f
        LEFT JOIN Person p ON f.PersonID = p.PersonID
        WHERE f.ComplaintID = ?
        ORDER BY f.FeedbackTimestamp DESC
      `, [id]);
      
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
      const [logs] = await db.query(`
        SELECT cl.*, 
               CASE 
                 WHEN cl.OfficerID IN (SELECT AssigningOfficerID FROM AssigningOfficer) 
                 THEN CONCAT(ao.FirstName, ' ', ao.LastName)
                 WHEN cl.OfficerID IN (SELECT ResolvingOfficerID FROM ResolvingOfficer) 
                 THEN CONCAT(ro.FirstName, ' ', ro.LastName)
                 ELSE 'System'
               END as OfficerName
        FROM ComplaintLog cl
        LEFT JOIN AssigningOfficer ao ON cl.OfficerID = ao.AssigningOfficerID
        LEFT JOIN ResolvingOfficer ro ON cl.OfficerID = ro.ResolvingOfficerID
        WHERE cl.ComplaintID = ?
        ORDER BY cl.Timestamp DESC
      `, [id]);
      
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
      await db.query(`
        INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription)
        VALUES (?, 'UPDATE', ?, NOW(), ?)
      `, [id, createdBy || 1, content]);
      
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
      const [updates] = await db.query(`
        SELECT cl.*, p.FirstName, p.LastName
        FROM ComplaintLog cl
        LEFT JOIN Person p ON cl.OfficerID = p.PersonID
        WHERE cl.ComplaintID = ? AND cl.ActionDescription IS NOT NULL
        ORDER BY cl.Timestamp DESC
      `, [id]);
      
      res.json(updates);
    } catch (error) {
      console.error('Error fetching updates:', error);
      res.status(500).json({ error: 'Failed to fetch updates' });
    }
  }
}