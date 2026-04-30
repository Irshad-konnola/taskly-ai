import { Router,Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
// Look at this! We are importing our shared monorepo package!
import { registerSchema,loginSchema } from "@taskly/shared";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
const router = Router();

// --- LOGIN ENDPOINT ---

router.post("/login", async (req, res): Promise<any> => {
  try {
    // 1. Validate incoming data
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid data", details: validation.error.format() });
    }

    const { email, password } = validation.data;

    // 2. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Check if the password matches the hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 4. Generate a new token
    const jwtSecret = process.env.JWT_SECRET || "super_secret_development_key";
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

    // 5. Send success response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET CURRENT USER (PROTECTED) ---
router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Because of requireAuth, we *know* req.user exists here
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true } // Don't select passwordHash!
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Fetch user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- REGISTER ENDPOINT ---
router.post("/register", async (req, res): Promise<any> => {
  try {
    // 1. Validate the incoming data using our Shared Zod Schema
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid data", 
        details: validation.error.format() 
      });
    }

    const { email, password, name } = validation.data;

    // 2. Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    // 3. Hash the password (NEVER save plain text passwords!)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Save the new user to the Postgres database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    // 5. Create a JWT Token so they can stay logged in
    const jwtSecret = process.env.JWT_SECRET || "super_secret_development_key";
    const token = jwt.sign({ userId: newUser.id }, jwtSecret, { expiresIn: "7d" });

    // 6. Return success! (We don't send the password hash back)
    return res.status(201).json({
      message: "User created successfully!",
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;