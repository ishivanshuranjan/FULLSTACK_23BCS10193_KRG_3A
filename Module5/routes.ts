import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateToken, hashPassword, comparePassword, authenticateToken, requireRole, type AuthRequest } from "./auth";
import { insertUserSchema, loginSchema, insertSessionSchema } from "@shared/schema";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // User routes
  app.get("/api/users", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get users" });
    }
  });

  // Session routes
  app.post("/api/sessions", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);

      // Generate QR code data with expiry (5 minutes from now)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const qrData = `SESSION_${randomUUID()};TYPE=${validatedData.type};EXP=${expiresAt.getTime()}`;

      const session = await storage.createSession({
        ...validatedData,
        qrCodeData: qrData,
        expiresAt,
      } as any);

      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create session" });
    }
  });

  app.get("/api/sessions", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get sessions" });
    }
  });

  app.get("/api/sessions/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get session" });
    }
  });

  app.patch("/api/sessions/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteSession(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete session" });
    }
  });

  app.post("/api/sessions/:id/regenerate-qr", authenticateToken, requireRole("admin"), async (req: AuthRequest, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Generate new QR code data with new expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const qrData = `SESSION_${randomUUID()};TYPE=${session.type};EXP=${expiresAt.getTime()}`;

      const updatedSession = await storage.updateSession(req.params.id, {
        qrCodeData: qrData,
        expiresAt,
      });

      res.json(updatedSession);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to regenerate QR code" });
    }
  });

  // Attendance routes
  app.post("/api/attendance/check", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { qrData } = req.body;

      if (!qrData || !req.user) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // Parse QR data: SESSION_<UUID>;TYPE=<checkin|checkout>;EXP=<timestamp>
      const parts = qrData.split(";");
      if (parts.length !== 3) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }

      const sessionIdMatch = parts[0].match(/SESSION_(.+)/);
      const typeMatch = parts[1].match(/TYPE=(.+)/);
      const expMatch = parts[2].match(/EXP=(.+)/);

      if (!sessionIdMatch || !typeMatch || !expMatch) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }

      const qrSessionId = sessionIdMatch[1];
      const type = typeMatch[1];
      const expiry = parseInt(expMatch[1]);

      // Check if QR code has expired
      if (Date.now() > expiry) {
        return res.status(400).json({ message: "QR code has expired" });
      }

      // Find the session in database that matches the QR data
      const sessions = await storage.getAllSessions();
      const session = sessions.find(s => s.qrCodeData === qrData && s.isActive);

      if (!session) {
        return res.status(404).json({ message: "Session not found or inactive" });
      }

      // Get or create attendance log for this user and session
      const existingLog = await storage.getAttendanceLog(req.user.userId, session.id);

      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"] || null;

      if (type === "checkin") {
        if (existingLog && existingLog.checkInTime) {
          return res.status(400).json({ message: "Already checked in for this session" });
        }

        if (existingLog) {
          // Update existing log
          const updated = await storage.updateAttendanceLog(existingLog.id, {
            checkInTime: new Date(),
            ipAddress,
            userAgent,
          });
          return res.json({ message: "Check-in successful", log: updated });
        } else {
          // Create new log
          const log = await storage.createAttendanceLog({
            userId: req.user.userId,
            sessionId: session.id,
            checkInTime: new Date(),
            checkOutTime: null,
            ipAddress,
            userAgent,
          });
          return res.json({ message: "Check-in successful", log });
        }
      } else if (type === "checkout") {
        if (!existingLog || !existingLog.checkInTime) {
          return res.status(400).json({ message: "Must check in before checking out" });
        }

        if (existingLog.checkOutTime) {
          return res.status(400).json({ message: "Already checked out for this session" });
        }

        const updated = await storage.updateAttendanceLog(existingLog.id, {
          checkOutTime: new Date(),
        });

        return res.json({ message: "Check-out successful", log: updated });
      } else {
        return res.status(400).json({ message: "Invalid QR code type" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Attendance check failed" });
    }
  });

  app.get("/api/attendance/logs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getAllAttendanceLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get attendance logs" });
    }
  });

  app.get("/api/attendance/my-logs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const logs = await storage.getAttendanceLogsByUser(req.user.userId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get attendance logs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
