<!-- 🔧 Prerequisites

Make sure you have the following installed:

Node.js (v18+)

npm (comes with Node)

Git

MongoDB Atlas account or a local MongoDB server

📥 Step 1 — Clone the Repository
git clone https://github.com/FernandSilva/ProjectJavaWebDev-BoxFit.git
cd ProjectJavaWebDev-BoxFit

🖥️ Step 2 — Backend Setup

Navigate into the backend folder:

cd backend


Install backend dependencies:

npm install


Create a .env file inside the backend folder:

PORT=5000
MONGODB_URI=mongodb+srv://<your-mongodb-connection-string>
JWT_SECRET=your_jwt_secret_here


Start the backend server:

npm run dev


Backend will run at:

👉 http://localhost:5000

🌐 Step 3 — Frontend Setup

Open a second terminal and navigate to the frontend:

cd frontend


Install frontend dependencies:

npm install


Create a .env file inside the frontend folder:

VITE_API_URL=http://localhost:5000


Start the frontend dev server:

npm run dev


Frontend will run at:

👉 http://localhost:5173

🚀 Step 4 — Run the Full Application

Ensure both servers are running:

Component	Command	URL
Backend	npm run dev	http://localhost:5000

Frontend	npm run dev	http://localhost:5173

Open the frontend:

👉 http://localhost:5173

You will now see BoxFit running locally.

📌 Important Notes
Migration: AppWrite → MongoDB

The project was initially built with AppWrite, but this became incompatible once a custom backend was required.
To meet the assignment’s requirements, the backend was rebuilt using:

Node.js

Express.js

Mongoose

MongoDB Atlas

This provides full control over authentication, routes, models, and API behavior.

📂 Project Structure
ProjectJavaWebDev-BoxFit/
 ├── backend/
 │   ├── controllers/
 │   ├── models/
 │   ├── routes/
 │   ├── server.js / server.ts
 │   └── .env
 ├── frontend/
 │   ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── vite.config.js
 │   └── .env
 └── README.md

☑️ Setup Checklist

Backend starts successfully

Frontend starts successfully

.env files setup in both folders

MongoDB connection working

App loads at http://localhost:5173 -->