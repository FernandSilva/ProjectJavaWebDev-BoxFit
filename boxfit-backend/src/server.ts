// server.ts
import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "src/routes/userRoutes";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Root route
app.get("/", (_req, res) => {
  res.send("BoxFit backend is running 🎯");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
