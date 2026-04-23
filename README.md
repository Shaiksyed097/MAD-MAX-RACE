# MAD MAX RACE - Bike Racing Management System

A complete MERN stack web application for managing bike racing events.

## Features

- **Riders**: Register, Login, Book track slots, View available races, Manage profile.
- **Admin**: Dashboard stats, Manage Riders, Manage Races, Manage Tracks.
- **Tech Stack**: React, Vite, Tailwind CSS v4, Lucide React, Express, Node.js, MongoDB.

## Setup Instructions

### 1. Requirements
Ensure you have Node.js and MongoDB installed on your system.

### 2. Environment Variables
Navigate to the `server` folder, copy `.env.example` to `.env`, and update the required credentials (MongoDB URI, JWT Secret, Cloudinary credentials, Nodemailer config).

### 3. Installation
Running the following command at the root folder will install dependencies for both `server` and `client`:
```bash
npm run install-all
```

Alternatively, you can manually install them:
```bash
cd server && npm install
cd ../client && npm install
```

### 4. Running the Application
From the root directory, run both servers concurrently:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`
The backend will run on `http://localhost:5000`

### 5. API Endpoints
- `POST /api/auth/register` - Register a new rider
- `POST /api/auth/login` - Login
- `GET /api/tracks` - Fetch all available racing tracks
- `POST /api/bookings` - Book a slot for a race
- `GET /api/dashboard/admin` - Fetch admin statistics

## Architecture
- `server/` contains the Express API with Mongoose schema models.
- `client/` contains the Vite+React frontend focused on a sleek UI using Tailwind CSS glassmorphism and animations.
