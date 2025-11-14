var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attendanceLogs: () => attendanceLogs,
  insertAttendanceLogSchema: () => insertAttendanceLogSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  sessions: () => sessions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  employeeId: text("employee_id").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user")
});
var sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionName: text("session_name").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  qrCodeData: text("qr_code_data"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var attendanceLogs = pgTable("attendance_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent")
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  qrCodeData: true,
  expiresAt: true,
  createdAt: true
});
var insertAttendanceLogSchema = createInsertSchema(attendanceLogs).omit({
  id: true
});
var loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1)
});

// server/storage.ts
import { eq, and, desc } from "drizzle-orm";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });
var DbStorage = class {
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }
  async createUser(user) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  // Session operations
  async createSession(session) {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }
  async getSession(id) {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }
  async getAllSessions() {
    return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  }
  async updateSession(id, data) {
    const result = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
    return result[0];
  }
  async deleteSession(id) {
    await db.delete(sessions).where(eq(sessions.id, id));
  }
  // Attendance operations
  async createAttendanceLog(log2) {
    const result = await db.insert(attendanceLogs).values(log2).returning();
    return result[0];
  }
  async getAttendanceLogsByUser(userId) {
    return await db.select().from(attendanceLogs).where(eq(attendanceLogs.userId, userId));
  }
  async getAttendanceLogsBySession(sessionId) {
    return await db.select().from(attendanceLogs).where(eq(attendanceLogs.sessionId, sessionId));
  }
  async getAllAttendanceLogs() {
    return await db.select().from(attendanceLogs);
  }
  async getAttendanceLog(userId, sessionId) {
    const result = await db.select().from(attendanceLogs).where(
      and(
        eq(attendanceLogs.userId, userId),
        eq(attendanceLogs.sessionId, sessionId)
      )
    );
    return result[0];
  }
  async updateAttendanceLog(id, data) {
    const result = await db.update(attendanceLogs).set(data).where(eq(attendanceLogs.id, id)).returning();
    return result[0];
  }
};
var storage = new DbStorage();

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
var JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key-change-in-production";
var JWT_EXPIRY = "7d";
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

// server/routes.ts
import { randomUUID } from "crypto";
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await comparePassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
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
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });
  app2.get("/api/users", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password: _, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get users" });
    }
  });
  app2.post("/api/sessions", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      const qrData = `SESSION_${randomUUID()};TYPE=${validatedData.type};EXP=${expiresAt.getTime()}`;
      const session = await storage.createSession({
        ...validatedData,
        qrCodeData: qrData,
        expiresAt
      });
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to create session" });
    }
  });
  app2.get("/api/sessions", authenticateToken, async (req, res) => {
    try {
      const sessions2 = await storage.getAllSessions();
      res.json(sessions2);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get sessions" });
    }
  });
  app2.get("/api/sessions/:id", authenticateToken, async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get session" });
    }
  });
  app2.patch("/api/sessions/:id", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update session" });
    }
  });
  app2.delete("/api/sessions/:id", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      await storage.deleteSession(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete session" });
    }
  });
  app2.post("/api/sessions/:id/regenerate-qr", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      const expiresAt = new Date(Date.now() + 5 * 60 * 1e3);
      const qrData = `SESSION_${randomUUID()};TYPE=${session.type};EXP=${expiresAt.getTime()}`;
      const updatedSession = await storage.updateSession(req.params.id, {
        qrCodeData: qrData,
        expiresAt
      });
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to regenerate QR code" });
    }
  });
  app2.post("/api/attendance/check", authenticateToken, async (req, res) => {
    try {
      const { qrData } = req.body;
      if (!qrData || !req.user) {
        return res.status(400).json({ message: "Invalid request" });
      }
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
      if (Date.now() > expiry) {
        return res.status(400).json({ message: "QR code has expired" });
      }
      const sessions2 = await storage.getAllSessions();
      const session = sessions2.find((s) => s.qrCodeData === qrData && s.isActive);
      if (!session) {
        return res.status(404).json({ message: "Session not found or inactive" });
      }
      const existingLog = await storage.getAttendanceLog(req.user.userId, session.id);
      const ipAddress = req.ip || req.socket.remoteAddress || null;
      const userAgent = req.headers["user-agent"] || null;
      if (type === "checkin") {
        if (existingLog && existingLog.checkInTime) {
          return res.status(400).json({ message: "Already checked in for this session" });
        }
        if (existingLog) {
          const updated = await storage.updateAttendanceLog(existingLog.id, {
            checkInTime: /* @__PURE__ */ new Date(),
            ipAddress,
            userAgent
          });
          return res.json({ message: "Check-in successful", log: updated });
        } else {
          const log2 = await storage.createAttendanceLog({
            userId: req.user.userId,
            sessionId: session.id,
            checkInTime: /* @__PURE__ */ new Date(),
            checkOutTime: null,
            ipAddress,
            userAgent
          });
          return res.json({ message: "Check-in successful", log: log2 });
        }
      } else if (type === "checkout") {
        if (!existingLog || !existingLog.checkInTime) {
          return res.status(400).json({ message: "Must check in before checking out" });
        }
        if (existingLog.checkOutTime) {
          return res.status(400).json({ message: "Already checked out for this session" });
        }
        const updated = await storage.updateAttendanceLog(existingLog.id, {
          checkOutTime: /* @__PURE__ */ new Date()
        });
        return res.json({ message: "Check-out successful", log: updated });
      } else {
        return res.status(400).json({ message: "Invalid QR code type" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message || "Attendance check failed" });
    }
  });
  app2.get("/api/attendance/logs", authenticateToken, async (req, res) => {
    try {
      const logs = await storage.getAllAttendanceLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get attendance logs" });
    }
  });
  app2.get("/api/attendance/my-logs", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const logs = await storage.getAttendanceLogsByUser(req.user.userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get attendance logs" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
