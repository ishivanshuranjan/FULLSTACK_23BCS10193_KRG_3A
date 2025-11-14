import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Session,
  InsertSession,
  AttendanceLog,
  InsertAttendanceLog,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;

  // Attendance operations
  createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog>;
  getAttendanceLogsByUser(userId: string): Promise<AttendanceLog[]>;
  getAttendanceLogsBySession(sessionId: string): Promise<AttendanceLog[]>;
  getAllAttendanceLogs(): Promise<AttendanceLog[]>;
  getAttendanceLog(userId: string, sessionId: string): Promise<AttendanceLog | undefined>;
  updateAttendanceLog(id: string, data: Partial<AttendanceLog>): Promise<AttendanceLog | undefined>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  // Session operations
  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(schema.sessions).values(session).returning();
    return result[0];
  }

  async getSession(id: string): Promise<Session | undefined> {
    const result = await db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
    return result[0];
  }

  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(schema.sessions).orderBy(desc(schema.sessions.createdAt));
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const result = await db
      .update(schema.sessions)
      .set(data)
      .where(eq(schema.sessions.id, id))
      .returning();
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }

  // Attendance operations
  async createAttendanceLog(log: InsertAttendanceLog): Promise<AttendanceLog> {
    const result = await db.insert(schema.attendanceLogs).values(log).returning();
    return result[0];
  }

  async getAttendanceLogsByUser(userId: string): Promise<AttendanceLog[]> {
    return await db
      .select()
      .from(schema.attendanceLogs)
      .where(eq(schema.attendanceLogs.userId, userId));
  }

  async getAttendanceLogsBySession(sessionId: string): Promise<AttendanceLog[]> {
    return await db
      .select()
      .from(schema.attendanceLogs)
      .where(eq(schema.attendanceLogs.sessionId, sessionId));
  }

  async getAllAttendanceLogs(): Promise<AttendanceLog[]> {
    return await db.select().from(schema.attendanceLogs);
  }

  async getAttendanceLog(userId: string, sessionId: string): Promise<AttendanceLog | undefined> {
    const result = await db
      .select()
      .from(schema.attendanceLogs)
      .where(
        and(
          eq(schema.attendanceLogs.userId, userId),
          eq(schema.attendanceLogs.sessionId, sessionId)
        )
      );
    return result[0];
  }

  async updateAttendanceLog(id: string, data: Partial<AttendanceLog>): Promise<AttendanceLog | undefined> {
    const result = await db
      .update(schema.attendanceLogs)
      .set(data)
      .where(eq(schema.attendanceLogs.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
