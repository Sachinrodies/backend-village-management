# Village Complaint Resolution System - Backend

A simple Node.js backend for managing village complaints.

## Features

- User registration and login (villagers and officers)
- Complaint management (create, view, update status)
- Department and village management
- Simple authentication system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database with the provided SQL schema

3. Create data directory:
```bash
mkdir data
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Villager login (phone + name)
- `POST /api/auth/register` - Villager registration
- `POST /api/auth/officer/login` - Officer login (email + password)

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint by ID
- `PUT /api/complaints/:id/status` - Update complaint status

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department

### Villages
- `GET /api/villages` - Get all villages
- `POST /api/villages` - Create village

### Persons
- `GET /api/persons` - Get all persons
- `POST /api/persons` - Create person

## Sample Officer Login

- Email: `anil@up.gov.in`
- Password: `password123`

## Database

Uses MySQL with the following main tables:
- Person (villagers)
- Complaint (complaints)
- Department (departments)
- Village (villages)
- AssigningOfficer (officers)