import { getAllComplaints, getComplaintById, getComplaintsByPerson, getDashboardStats, getComplaintsByOfficer } from './complaints/reads.js';
import { createComplaint, updateComplaintStatus, assignComplaint, addComplaintUpdate } from './complaints/writes.js';
import { getComplaintFeedback, getComplaintLogs, getComplaintUpdates } from './complaints/logs.js';
import { submitFeedback } from './complaints/feedback.js';
import { deleteComplaint, resetAllAssignments, deleteTestComplaints } from './complaints/maintenance.js';
import { transferComplaintDepartment } from './complaints/transfers.js';

export class ComplaintService {
  static getAllComplaints = getAllComplaints;
  static getComplaintById = getComplaintById;
  static createComplaint = createComplaint;
  static updateComplaintStatus = updateComplaintStatus;
  static getComplaintsByPerson = getComplaintsByPerson;
  static getDashboardStats = getDashboardStats;
  static assignComplaint = assignComplaint;
  static getComplaintsByOfficer = getComplaintsByOfficer;
  static submitFeedback = submitFeedback;
  static getComplaintFeedback = getComplaintFeedback;
  static getComplaintLogs = getComplaintLogs;
  static addComplaintUpdate = addComplaintUpdate;
  static getComplaintUpdates = getComplaintUpdates;
  static deleteComplaint = deleteComplaint;
  static transferComplaintDepartment = transferComplaintDepartment;
  static resetAllAssignments = resetAllAssignments;
  static deleteTestComplaints = deleteTestComplaints;
}

