import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createUser } from "./src/controllers/userController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Route for creating a user
app.post("/api/users", createUser);

// Default test route
app.get("/", (req, res) => {
  res.send("BoxFit backend is running ✅");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
