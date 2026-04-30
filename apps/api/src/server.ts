import express from "express";
import cors from "cors";
import { prisma } from "./db.js"; // Note the .js extension for modern Node!
import "dotenv/config";
import authRoutes from "./routes/auth.js"

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to read JSON bodies from the frontend

app.use("/api/auth", authRoutes);

// 1. Standard Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Taskly API is running!" });
});

// 2. Database Test Endpoint (Fetch all users)
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users from database" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});