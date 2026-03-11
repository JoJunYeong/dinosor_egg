import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ── Student helpers ───────────────────────────────────────────────────────────
import {
  students, studentData, appSettings,
  type InsertStudent,
} from "../drizzle/schema";

export async function getAllStudents(classId = "default") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).where(eq(students.classId, classId));
}

export async function upsertStudent(student: InsertStudent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(students).values(student).onDuplicateKeyUpdate({
    set: { name: student.name, sortOrder: student.sortOrder },
  });
}

export async function deleteStudent(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(students).where(eq(students.id, id));
  await db.delete(studentData).where(eq(studentData.studentId, id));
}

// ── Student data helpers ──────────────────────────────────────────────────────

export async function getStudentData(studentId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(studentData).where(eq(studentData.studentId, studentId)).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    studentId: row.studentId,
    eggs: JSON.parse(row.eggs) as boolean[][],
    dates: JSON.parse(row.dates) as string[],
    goals: JSON.parse(row.goals) as number[],
    soundEnabled: row.soundEnabled === 1,
  };
}

export async function upsertStudentData(
  studentId: string,
  eggs: boolean[][],
  dates: string[],
  goals: number[],
  soundEnabled: boolean,
) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: studentData.id }).from(studentData)
    .where(eq(studentData.studentId, studentId)).limit(1);
  const payload = {
    studentId,
    eggs: JSON.stringify(eggs),
    dates: JSON.stringify(dates),
    goals: JSON.stringify(goals),
    soundEnabled: soundEnabled ? 1 : 0,
  };
  if (existing.length > 0) {
    await db.update(studentData).set(payload).where(eq(studentData.studentId, studentId));
  } else {
    await db.insert(studentData).values(payload);
  }
}

// ── App settings helpers ──────────────────────────────────────────────────────

export async function getAppSettings(classId = "default") {
  const db = await getDb();
  if (!db) return { pin: "0000" };
  const rows = await db.select().from(appSettings).where(eq(appSettings.classId, classId)).limit(1);
  if (rows.length === 0) return { pin: "0000" };
  return { pin: rows[0].pin };
}

export async function upsertAppSettings(classId = "default", pin: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: appSettings.id }).from(appSettings)
    .where(eq(appSettings.classId, classId)).limit(1);
  if (existing.length > 0) {
    await db.update(appSettings).set({ pin }).where(eq(appSettings.classId, classId));
  } else {
    await db.insert(appSettings).values({ classId, pin });
  }
}
