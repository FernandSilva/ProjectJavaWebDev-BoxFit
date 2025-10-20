<!-- # 🥊 BoxFit — Local Installation Guide

Follow the steps below to install and run the **BoxFit** full-stack application on your local machine.

---

## ⚙️ Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (version 18 or higher)  
- **npm** (comes with Node.js)  
- **MongoDB Atlas account** or **local MongoDB instance**  
- **Git**

---

## 🧩 Step 1 — Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/FernandSilva/ProjectJavaWebDev-BoxFit.git
cd ProjectJavaWebDev-BoxFit
🖥️ Step 2 — Set Up the Backend
Navigate into the backend folder:

bash
Copy code
cd backend
Install all backend dependencies:

bash
Copy code
npm install
Create a .env file inside the backend folder and add the following:

env
Copy code
PORT=5000
MONGODB_URI=mongodb+srv://<your-mongodb-connection-string>
JWT_SECRET=your_jwt_secret
Start the backend server in development mode:

bash
Copy code
npm run dev
The backend will now run at:

arduino
Copy code
http://localhost:5000
🌐 Step 3 — Set Up the Frontend
Open a new terminal window (keep the backend running).
Navigate into the frontend folder:

bash
Copy code
cd ../frontend
Install all frontend dependencies:

bash
Copy code
npm install
Create a .env file inside the frontend folder and add the following:

env
Copy code
VITE_API_URL=http://localhost:5000
Start the frontend development server:

bash
Copy code
npm run dev
The frontend will now run at:

arduino
Copy code
http://localhost:5173
🚀 Step 4 — Run the Full Application
Ensure both servers are running:

Backend: http://localhost:5000

Frontend: http://localhost:5173

Open your browser and go to:

arduino
Copy code
http://localhost:5173
You should now see the BoxFit application running locally.

✅ Summary
Component	Command	URL
Backend	npm run dev	http://localhost:5000
Frontend	npm run dev	http://localhost:5173
 -->
