import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Student management table
export const students = mysqlTable("students", {
  id: varchar("id", { length: 64 }).primaryKey(), // UUID
  classId: varchar("classId", { length: 64 }).notNull().default("default"), // class/teacher group
  name: varchar("name", { length: 100 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

// Per-student grid data (eggs, dates, goals)
export const studentData = mysqlTable("studentData", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull(),
  eggs: text("eggs").notNull(), // JSON: boolean[][] 29x29
  dates: text("dates").notNull(), // JSON: string[] 29
  goals: text("goals").notNull(), // JSON: number[] 29
  soundEnabled: int("soundEnabled").default(0).notNull(), // 0=false, 1=true
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentDataRow = typeof studentData.$inferSelect;
export type InsertStudentData = typeof studentData.$inferInsert;

// App settings (PIN etc.)
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  classId: varchar("classId", { length: 64 }).notNull().default("default"),
  pin: varchar("pin", { length: 10 }).notNull().default("0000"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSettingsRow = typeof appSettings.$inferSelect;