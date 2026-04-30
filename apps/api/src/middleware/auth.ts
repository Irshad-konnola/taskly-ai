import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request type so TypeScript knows we are adding a user object to it
export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): any => {
  // 1. Look for the token in the headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  // 2. Extract the actual token string (removing "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify the token
    const jwtSecret = process.env.JWT_SECRET || "super_secret_development_key";
    const payload = jwt.verify(token, jwtSecret) as { userId: string };

    // 4. Attach the user ID to the request so the next function can use it
    req.user = payload;
    
    // 5. Let them through!
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};