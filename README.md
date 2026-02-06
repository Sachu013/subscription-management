# Personal Online Subscription Management System

A web application to manage personal subscriptions (Netflix, Spotify, Utilities, etc.), track costs, and monitor renewal dates. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **User Authentication:** Secure Registration & Login using JWT.
- **Dashboard:** Overview of all active subscriptions.
- **Subscription Management:** Add, Edit, and Delete subscriptions.
- **Smart Logic:**
    - Search by name.
    - Filter by category.
    - Sort by renewal date or cost.
- **Smart UI:**
    - Responsive design for mobile & desktop.
    - Toast notifications for actions.
    - Loading spinners for better UX.

## Tech Stack
- **Frontend:** React.js, React Router, Axios, CSS Modules (Custom).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Cloud).
- **Authentication:** JSON Web Token (JWT), BCrypt.js.
- **Deployment:** Vercel (Frontend), Render (Backend).

## Local Setup

### Prerequisites
- Node.js installed.
- MongoDB Atlas account (Connection String).

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Make sure to create a `.env` file in `backend/` with:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

## API Endpoints
- **Auth:**
    - `POST /api/auth/register`
    - `POST /api/auth/login`
- **Subscriptions:**
    - `GET /api/subscriptions`
    - `POST /api/subscriptions`
    - `PUT /api/subscriptions/:id`
    - `DELETE /api/subscriptions/:id`
