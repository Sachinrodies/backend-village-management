## Village Complaint Backend (Express + MySQL)

Simple REST API for the Village Complaint Resolution system.

### Prerequisites
- Node.js 18+
- MySQL 8+ (or compatible)

### Setup
1. Create a `.env` file in this directory with:

```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=village_db
```

2. Install dependencies:

```
npm install
```

3. Start the API (dev):

```
npm run dev
```

### Routes
- GET `/api/health` – server and DB check

Persons:
- GET `/api/persons?limit=20&offset=0`
- GET `/api/persons/:id`
- POST `/api/persons`
- PUT `/api/persons/:id`
- DELETE `/api/persons/:id`

Complaints:
- GET `/api/complaints?limit=20&offset=0`
- GET `/api/complaints/:id`
- POST `/api/complaints`
- PUT `/api/complaints/:id`
- DELETE `/api/complaints/:id`

### Notes
- This backend assumes your tables are already created (e.g. `Person`, `Complaint`).
- Queries use parameterized statements via `mysql2/promise`.
- CORS is enabled for all origins by default.


