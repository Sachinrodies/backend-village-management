import { db } from '../index.js';

export class ComplaintController {
  // Get complaint workflow status
  static async getWorkflowStatus(complaintId) {
    try {
      const [complaint] = await db.query(`
        SELECT c.*, 
               p.FirstName, p.LastName, p.PhoneNumber,
               d.DepartmentName,
               v.VillageName
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        WHERE c.ComplaintID = ?
      `, [complaintId]);

      if (complaint.length === 0) {
        throw new Error('Complaint not found');
      }

      // Get assignment details
      const [assignments] = await db.query(`
        SELECT ca.*, 
               p1.FirstName as AssigningFirstName, p1.LastName as AssigningLastName,
               p2.FirstName as ResolvingFirstName, p2.LastName as ResolvingLastName,
               d.DepartmentName
        FROM ComplaintAssignment ca
        LEFT JOIN AssigningOfficer ao ON ca.AssigningOfficerID = ao.AssigningOfficerID
        LEFT JOIN ResolvingOfficer ro ON ca.ResolvingOfficerID = ro.ResolvingOfficerID
        LEFT JOIN Person p1 ON ao.PersonID = p1.PersonID
        LEFT JOIN Person p2 ON ro.PersonID = p2.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        WHERE ca.ComplaintID = ?
        ORDER BY ca.AssignmentTimestamp DESC
      `, [complaintId]);

      // Get workflow logs
      const [logs] = await db.query(`
        SELECT cl.*, p.FirstName, p.LastName
        FROM ComplaintLog cl
        LEFT JOIN Person p ON cl.OfficerID = p.PersonID
        WHERE cl.ComplaintID = ?
        ORDER BY cl.Timestamp ASC
      `, [complaintId]);

      return {
        complaint: complaint[0],
        assignments,
        workflowLogs: logs,
        currentStatus: complaint[0].Status,
        isAssigned: assignments.length > 0,
        currentAssignment: assignments[0] || null
      };
    } catch (error) {
      throw error;
    }
  }

  // Process complaint through workflow
  static async processWorkflow(complaintId, action, data) {
    try {
      const workflow = await this.getWorkflowStatus(complaintId);
      const { complaint, currentAssignment } = workflow;

      switch (action) {
        case 'assign':
          return await this.assignComplaint(complaintId, data);
        
        case 'accept_assignment':
          return await this.acceptAssignment(complaintId, data);
        
        case 'reject_assignment':
          return await this.rejectAssignment(complaintId, data);
        
        case 'start_work':
          return await this.startWork(complaintId, data);
        
        case 'update_progress':
          return await this.updateProgress(complaintId, data);
        
        case 'resolve':
          return await this.resolveComplaint(complaintId, data);
        
        case 'reject':
          return await this.rejectComplaint(complaintId, data);
        
        case 'close':
          return await this.closeComplaint(complaintId, data);
        
        default:
          throw new Error('Invalid workflow action');
      }
    } catch (error) {
      throw error;
    }
  }

  // Assign complaint to officer
  static async assignComplaint(complaintId, { assigningOfficerId, resolvingOfficerId }) {
    try {
      await db.query('START TRANSACTION');
      
      // Create assignment
      const [assignmentResult] = await db.query(
        'INSERT INTO ComplaintAssignment (ComplaintID, AssigningOfficerID, ResolvingOfficerID, AssignmentTimestamp) VALUES (?, ?, ?, NOW())',
        [complaintId, assigningOfficerId, resolvingOfficerId]
      );
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['ASSIGNED', complaintId]
      );
      
      // Log the assignment
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'ASSIGNED', assigningOfficerId, 'Complaint assigned to officer']
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Complaint assigned successfully',
        assignmentId: assignmentResult.insertId
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Accept assignment
  static async acceptAssignment(complaintId, { officerId, notes }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['IN_PROGRESS', complaintId]
      );
      
      // Log the acceptance
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'IN_PROGRESS', officerId, `Assignment accepted. ${notes || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Assignment accepted successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Reject assignment
  static async rejectAssignment(complaintId, { officerId, notes }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status back to NEW
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['NEW', complaintId]
      );
      
      // Log the rejection
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'NEW', officerId, `Assignment rejected. ${notes || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Assignment rejected successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Start work on complaint
  static async startWork(complaintId, { officerId, notes }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['IN_PROGRESS', complaintId]
      );
      
      // Log the start of work
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'IN_PROGRESS', officerId, `Work started on complaint. ${notes || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Work started successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Update progress
  static async updateProgress(complaintId, { officerId, notes }) {
    try {
      await db.query('START TRANSACTION');
      
      // Log the progress update
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'IN_PROGRESS', officerId, `Progress update: ${notes}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Progress updated successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Resolve complaint
  static async resolveComplaint(complaintId, { officerId, notes, resolutionDetails }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['RESOLVED', complaintId]
      );
      
      // Log the resolution
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'RESOLVED', officerId, `Complaint resolved. ${notes || ''} ${resolutionDetails || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Complaint resolved successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Reject complaint
  static async rejectComplaint(complaintId, { officerId, notes, rejectionReason }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['REJECTED', complaintId]
      );
      
      // Log the rejection
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'REJECTED', officerId, `Complaint rejected. Reason: ${rejectionReason || ''} ${notes || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Complaint rejected successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Close complaint
  static async closeComplaint(complaintId, { officerId, notes }) {
    try {
      await db.query('START TRANSACTION');
      
      // Update complaint status
      await db.query(
        'UPDATE Complaint SET Status = ? WHERE ComplaintID = ?',
        ['CLOSED', complaintId]
      );
      
      // Log the closure
      await db.query(
        'INSERT INTO ComplaintLog (ComplaintID, Status, OfficerID, Timestamp, ActionDescription) VALUES (?, ?, ?, NOW(), ?)',
        [complaintId, 'CLOSED', officerId, `Complaint closed. ${notes || ''}`]
      );
      
      await db.query('COMMIT');
      
      return {
        success: true,
        message: 'Complaint closed successfully'
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  // Get dashboard data for different user roles
  static async getDashboardData(userRole, userId, filters = {}) {
    try {
      let baseQuery = `
        SELECT c.*, 
               p.FirstName, p.LastName, p.PhoneNumber, p.Email,
               d.DepartmentName,
               v.VillageName, v.District, v.Block,
               ca.AssignmentID, ca.AssignedBy, ca.AssignedTo, ca.AssignmentDate, ca.Status as AssignmentStatus,
               p1.FirstName as AssignedByFirstName, p1.LastName as AssignedByLastName,
               p2.FirstName as AssignedToFirstName, p2.LastName as AssignedToLastName
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Department d ON c.DepartmentID = d.DepartmentID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        LEFT JOIN ComplaintAssignment ca ON c.ComplaintID = ca.ComplaintID
        LEFT JOIN Person p1 ON ca.AssignedBy = p1.PersonID
        LEFT JOIN Person p2 ON ca.AssignedTo = p2.PersonID
        WHERE 1=1
      `;

      const params = [];

      // Apply role-based filtering
      switch (userRole) {
        case 'villager':
          baseQuery += ' AND c.PersonID = ?';
          params.push(userId);
          break;
        
        case 'resolution_officer':
          baseQuery += ' AND ca.ResolvingOfficerID = ?';
          params.push(userId);
          break;
        
        case 'assigning_officer':
          baseQuery += ' AND ca.AssigningOfficerID = ?';
          params.push(userId);
          break;
        
        // Location-based filters removed because Village may not have District/Block
        case 'department_head':
        case 'block_officer':
        case 'district_officer':
          // Fall back to department filter only if needed
          break;
      }

      // Apply additional filters
      if (filters.status) {
        baseQuery += ' AND c.Status = ?';
        params.push(filters.status);
      }
      if (filters.department) {
        baseQuery += ' AND c.DepartmentID = ?';
        params.push(filters.department);
      }
      // Removed district/block filters

      baseQuery += ' ORDER BY c.ComplaintID DESC';

      const [complaints] = await db.query(baseQuery, params);

      // Get statistics
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as totalComplaints,
          SUM(CASE WHEN Status = 'NEW' THEN 1 ELSE 0 END) as newComplaints,
          SUM(CASE WHEN Status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedComplaints,
          SUM(CASE WHEN Status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressComplaints,
          SUM(CASE WHEN Status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedComplaints,
          SUM(CASE WHEN Status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedComplaints,
          SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as closedComplaints
        FROM Complaint c
        LEFT JOIN Person p ON c.PersonID = p.PersonID
        LEFT JOIN Village v ON p.CensusVillageCode = v.CensusVillageCode
        WHERE 1=1
        ${userRole === 'villager' ? 'AND c.PersonID = ?' : ''}
        ${userRole === 'resolution_officer' ? 'AND EXISTS (SELECT 1 FROM ComplaintAssignment ca WHERE ca.ComplaintID = c.ComplaintID AND ca.ResolvingOfficerID = ?)' : ''}
        ${userRole === 'assigning_officer' ? 'AND EXISTS (SELECT 1 FROM ComplaintAssignment ca WHERE ca.ComplaintID = c.ComplaintID AND ca.AssigningOfficerID = ?)' : ''}
      `, userRole === 'villager' || userRole === 'resolution_officer' || userRole === 'assigning_officer' ? [userId] : []);

      return {
        complaints,
        statistics: stats[0]
      };
    } catch (error) {
      throw error;
    }
  }
}
