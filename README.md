# Finance Data Processing & Access Control Dashboard

A complete, production-ready full-stack MERN application that provides comprehensive financial records management, insightful dashboards, and strict role-based access control (RBAC).

## Table of Contents
- [Architecture & Design](#architecture--design)
- [Project Setup](#project-setup)
- [API Documentation](#api-documentation)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Tradeoffs & Assumptions](#tradeoffs--assumptions)

---

## Architecture & Design

This application uses the MERN stack (MongoDB, Express, React, Node.js) divided cleanly into two separate repositories/folders:

1. **Backend** (Node.js / Express): 
   - Uses the traditional MVC-like approach.
   - `models/`: Mongoose schemas defining our entity structure (`User` and `Record`).
   - `routes/`: Express routers isolating domains (`/auth`, `/users`, `/records`).
   - `middleware/`: Reusable Express middleware for JWT verification (`protect`) and role-based gating (`authorize`).
   - **Validation & Error Handling**: Data validation is enforced before database interaction using `Joi`. Standardized HTTP status codes are strictly returned (e.g., `401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `404 Not Found`).

2. **Frontend** (React / Vite): 
   - A highly polished, aesthetic dashboard built with `Tailwind CSS v4`.
   - Utilizes `Chart.js` for data visualization.
   - Context API (`AuthContext.jsx`) is used for managing global authentication state and role accessibility.

---

## Project Setup

### Prerequisites
- Node.js (v16+)
- Local MongoDB Instance running on port `27017` (or cloud Atlas cluster URI).

### 1. Backend Initialization
```bash
cd backend
npm install
```
Ensure you have a `.env` file in the `backend/` root directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finance-dashboard
JWT_SECRET=super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Initialization
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

---

## API Documentation

We utilize **Swagger UI** to automatically document all exposed backend endpoints natively.

With the backend running locally, you can view the fully interactive Swagger Interface by navigating to:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)** 

### Summary Endpoints
- `POST /api/auth/register` & `POST /api/auth/login` (Authentication)
- `GET /api/records` (Supports `?page`, `?limit`, `?category`, `?type`, `?startDate`, `?endDate`)
- `GET /api/records/analytics` (Aggregated dynamic data processing for the UI dashboard)
- `CRUD /api/records/:id` (Restricted management of individual records)
- `CRUD /api/users` (Admin-only namespace for user profiling and status toggling)

---

## Role-Based Access Control (RBAC)

The system leverages JWT tokens to enforce access layers. There are three tiers:

1. **Viewer**:
   - Least privilege.
   - Can read standard records via `GET /api/records`.
   - Cannot create, update, or delete records. Cannot view system-wide `.analytics` aggregations.
   
2. **Analyst**:
   - Can view standard records.
   - Can access `GET /api/records/analytics` to view the aggregated dashboard data and insights (Total balances, categorized spending, trends).
   - Cannot modify records or manage users.
   
3. **Admin**:
   - Full read/write access to system.
   - Can perform full CRUD on `/api/records`.
   - Can access the `/api/users` endpoints to upgrade/downgrade roles of other users, and toggle their `active/inactive` status.

---

## Tradeoffs & Assumptions

1. **Analytical Aggregation**: Currently, the `/api/records/analytics` endpoint processes data in-memory within the Node instance via `reduce`. While this works flawlessly for a small-to-medium datasets and demonstrates logical grouping (transforming array data into mapping constructs), a production system with millions of rows would instead leverage MongoDB's native `$aggregate` pipelines to offload the computational cost directly to the database cluster.
2. **Hard Deletes vs Soft Deletes**: The current implementation utilizes hard deletes (`deleteOne()`) for Financial Records. Depending on auditing requirements, financial systems often favor "soft deletes" (`isDeleted: true`).
3. **Admin Assignment**: By default, the first user registering assumes the `Viewer` role. To test Admin functionality, users currently must manually upgrade themselves via direct MongoDB manipulation, demonstrating that the backend fundamentally secures assignment rights.
