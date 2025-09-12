# Village Complaint Resolution System - API Documentation

## Overview
This API provides comprehensive endpoints for managing village complaints through a complete workflow system. The system handles the flow from complaint registration by villagers to resolution by officers.

## Base URL
```
http://localhost:4000/api
```

## Authentication
Currently, the API does not implement authentication. In production, you should add JWT or session-based authentication.

## Database Schema


The system uses the following main tables:
- `Person` - Villager information
- `Complaint` - Complaint details
- `Department` - Government departments
- `Village` - Village information
- `AssigningOfficer` - Officers who assign complaints
- `ResolvingOfficer` - Officers who resolve complaints
- `ComplaintAssignment` - Assignment tracking
- `ComplaintLog` - Status change logs
- `Feedback` - User feedback on resolved complaints

## API Endpoints

### 1. Complaints

#### GET /complaints
Get all complaints with filtering options
- Query Parameters:
  - `limit` (optional): Number of records (1-100, default: 20)
  - `offset` (optional): Starting record (default: 0)
  - `status` (optional): Filter by status (NEW, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED, CLOSED)
  - `department` (optional): Filter by department ID
  - `district` (optional): Filter by district
  - `block` (optional): Filter by block

#### GET /complaints/:id
Get specific complaint with full details including logs and feedback

#### POST /complaints
Create a new complaint
- Body: `{ PersonID, DepartmentID, Description, PriorityLevel, LocationDescription, AttachmentPath }`

#### PUT /complaints/:id
Update complaint details

#### DELETE /complaints/:id
Delete a complaint

#### POST /complaints/:id/assign
Assign complaint to an officer
- Body: `{ AssignedBy, AssignedTo, DepartmentID, Notes }`

#### PUT /complaints/:id/status
Update complaint status
- Body: `{ Status, UpdatedBy, Notes }`

#### GET /complaints/person/:personId
Get complaints by specific person

#### GET /complaints/officer/:officerId
Get complaints assigned to specific officer

#### GET /complaints/stats/overview
Get complaint statistics

### 2. Persons

#### GET /persons
Get all persons with pagination

#### GET /persons/:id
Get specific person details

#### POST /persons
Create a new person
- Body: `{ FirstName, LastName, PhoneNumber, Gender, DateOfBirth, Address, CensusVillageCode, Occupation, AadharNumber, MiddleName }`

#### PUT /persons/:id
Update person details

#### DELETE /persons/:id
Delete a person

### 3. Departments

#### GET /departments
Get all departments

#### GET /departments/:id
Get specific department

#### POST /departments
Create a new department
- Body: `{ DepartmentName, Description, District, Block }`

#### PUT /departments/:id
Update department

#### DELETE /departments/:id
Delete department

#### GET /departments/district/:district/block/:block
Get departments by location

### 4. Villages

#### GET /villages
Get all villages

#### GET /villages/:id
Get specific village

#### POST /villages
Create a new village
- Body: `{ VillageName, CensusVillageCode, District, Block, State }`

#### PUT /villages/:id
Update village

#### DELETE /villages/:id
Delete village

#### GET /villages/district/:district/block/:block
Get villages by location

### 5. Assigning Officers

#### GET /assigning-officers
Get all assigning officers with person and department details

#### GET /assigning-officers/:id
Get specific assigning officer

#### POST /assigning-officers
Create a new assigning officer
- Body: `{ PersonID, DepartmentID, Designation, District, Block }`

#### PUT /assigning-officers/:id
Update assigning officer

#### DELETE /assigning-officers/:id
Delete assigning officer

#### GET /assigning-officers/department/:departmentId
Get assigning officers by department

### 6. Resolving Officers

#### GET /resolving-officers
Get all resolving officers with person and department details

#### GET /resolving-officers/:id
Get specific resolving officer

#### POST /resolving-officers
Create a new resolving officer
- Body: `{ PersonID, DepartmentID, Designation, District, Block }`

#### PUT /resolving-officers/:id
Update resolving officer

#### DELETE /resolving-officers/:id
Delete resolving officer

#### GET /resolving-officers/department/:departmentId
Get resolving officers by department

### 7. Complaint Assignments

#### GET /complaint-assignments
Get all complaint assignments

#### GET /complaint-assignments/:id
Get specific assignment

#### POST /complaint-assignments
Create a new assignment
- Body: `{ ComplaintID, AssignedBy, AssignedTo, DepartmentID, AssignmentDate, Status, Notes }`

#### PUT /complaint-assignments/:id
Update assignment

#### DELETE /complaint-assignments/:id
Delete assignment

#### GET /complaint-assignments/complaint/:complaintId
Get assignments for specific complaint

#### GET /complaint-assignments/officer/:officerId
Get assignments for specific officer

### 8. Complaint Logs

#### GET /complaint-logs
Get all complaint logs

#### GET /complaint-logs/:id
Get specific log entry

#### POST /complaint-logs
Create a new log entry
- Body: `{ ComplaintID, Status, UpdatedBy, UpdateDate, Notes }`

#### PUT /complaint-logs/:id
Update log entry

#### DELETE /complaint-logs/:id
Delete log entry

#### GET /complaint-logs/complaint/:complaintId
Get logs for specific complaint

### 9. Feedback

#### GET /feedback
Get all feedback

#### GET /feedback/:id
Get specific feedback

#### POST /feedback
Create a new feedback
- Body: `{ ComplaintID, PersonID, Rating, Comments, FeedbackDate }`

#### PUT /feedback/:id
Update feedback

#### DELETE /feedback/:id
Delete feedback

#### GET /feedback/complaint/:complaintId
Get feedback for specific complaint

#### GET /feedback/person/:personId
Get feedback by specific person

### 10. Workflow Management

#### GET /workflow/complaint/:id/status
Get complete workflow status for a complaint

#### POST /workflow/complaint/:id/action/:action
Process workflow action
- Actions: `assign`, `accept_assignment`, `reject_assignment`, `start_work`, `update_progress`, `resolve`, `reject`, `close`

#### GET /workflow/dashboard/:userRole/:userId
Get dashboard data for specific user role
- User Roles: `villager`, `admin`, `district_officer`, `block_officer`, `department_head`, `resolution_officer`

#### POST /workflow/complaint/:id/assign
Assign complaint (with validation)

#### POST /workflow/complaint/:id/accept
Accept assignment

#### POST /workflow/complaint/:id/reject-assignment
Reject assignment

#### POST /workflow/complaint/:id/start-work
Start work on complaint

#### POST /workflow/complaint/:id/progress
Update progress

#### POST /workflow/complaint/:id/resolve
Resolve complaint

#### POST /workflow/complaint/:id/reject
Reject complaint

#### POST /workflow/complaint/:id/close
Close complaint

#### GET /workflow/stats
Get workflow statistics

## Complaint Workflow

The complaint resolution follows this workflow:

1. **NEW** - Complaint is created by a villager
2. **ASSIGNED** - Complaint is assigned to an officer by assigning officer
3. **IN_PROGRESS** - Officer accepts assignment and starts working
4. **RESOLVED** - Officer marks complaint as resolved
5. **CLOSED** - Complaint is closed after resolution
6. **REJECTED** - Complaint is rejected at any stage

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (Duplicate entry)
- `500` - Internal Server Error

## Error Response Format

```json
{
  "error": "Error message",
  "message": "Additional details (in development mode)"
}
```

## Example Usage

### Create a Complaint
```bash
curl -X POST http://localhost:4000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "PersonID": 1,
    "DepartmentID": 1,
    "Description": "Road needs repair in front of my house",
    "PriorityLevel": "HIGH",
    "LocationDescription": "Near village center"
  }'
```

### Assign Complaint
```bash
curl -X POST http://localhost:4000/api/workflow/complaint/1/assign \
  -H "Content-Type: application/json" \
  -d '{
    "AssignedBy": 2,
    "AssignedTo": 3,
    "DepartmentID": 1,
    "Notes": "Urgent repair needed"
  }'
```

### Get Dashboard Data
```bash
curl -X GET "http://localhost:4000/api/workflow/dashboard/resolution_officer/3?status=IN_PROGRESS"
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=VillageComplaintResolutionSystem
PORT=4000
NODE_ENV=development
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start on port 4000 by default.
