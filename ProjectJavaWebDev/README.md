<!-- BoxFit — Full-Stack Gym Dashboard

A fully responsive gym member portal built with React, Node.js, Express, and MongoDB.
Users can register, log in, update profiles, create posts, comment, like, and view gym information pages.

🔧 Prerequisites

Before installing, ensure you have:

Node.js v18+

npm (bundled with Node)

Git

MongoDB Atlas account (recommended)
or a local MongoDB server

📥 Step 1 — Clone the Repository
git clone https://github.com/FernandSilva/ProjectJavaWebDev-BoxFit.git
cd ProjectJavaWebDev-BoxFit

🖥️ Step 2 — Backend Setup

Navigate into the backend:

cd backend


Install dependencies:

npm install

Create a .env file inside /backend
PORT=5000
MONGODB_URI=mongodb+srv://<your-mongo-connection-string>
JWT_SECRET=your_jwt_secret_here


✔ Important:
The backend runs on JavaScript files (server.js), not TypeScript.
Render does not execute TypeScript directly, so .js versions are included.

Start the backend server:

npm run dev


Backend will run at:

👉 http://localhost:5000

🌐 Step 3 — Frontend Setup

Navigate to the frontend:

cd ../frontend


Install dependencies:

npm install


Create a .env file:

VITE_API_URL=http://localhost:5000


Start the frontend:

npm run dev


Frontend runs at:

👉 http://localhost:5173

🚀 Step 4 — Run the Full Application

Make sure both servers are running:

Component	Command	URL
Backend	npm run dev	http://localhost:5000

Frontend	npm run dev	http://localhost:5173

Open the frontend in your browser:

👉 http://localhost:5173

You should now see BoxFit running locally.

🗂️ Project Structure
ProjectJavaWebDev-BoxFit/
 ├── backend/
 │   ├── controllers/
 │   ├── models/
 │   ├── routes/
 │   ├── uploads/               ← image storage folder
 │   ├── server.js
 │   └── .env
 ├── frontend/
 │   ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── vite.config.js
 │   └── .env
 └── README.md

📌 Important Notes
AppWrite → MongoDB Migration

The project originally used AppWrite on the frontend with no backend.
Because the assignment required a custom backend, the entire architecture was rebuilt:

Added Node.js + Express backend

Designed MongoDB schemas (User, Post, Comment)

Replaced all AppWrite SDK calls

Updated React Query hooks to use new REST endpoints

Added CORS to support Render deployment

This transformation enabled full-stack functionality and complete control of data.

📸 Image Upload Behavior

Images uploaded in posts are stored locally in /backend/uploads.

If this folder is missing on first install, create it manually:

mkdir backend/uploads

☑️ Local Setup Checklist

Backend starts without errors

Frontend starts without errors

Both .env files created correctly

MongoDB connection successful

Images upload successfully

App loads at http://localhost:5173

All routes and UI pages working

🎉 You’re ready to run BoxFit locally! -->