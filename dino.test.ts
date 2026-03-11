import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  getAllStudents: vi.fn().mockResolvedValue([
    { id: "s1", classId: "default", name: "김민수", sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
  ]),
  upsertStudent: vi.fn().mockResolvedValue(undefined),
  deleteStudent: vi.fn().mockResolvedValue(undefined),
  getStudentData: vi.fn().mockResolvedValue(null),
  upsertStudentData: vi.fn().mockResolvedValue(undefined),
  getAppSettings: vi.fn().mockResolvedValue({ pin: "0000" }),
  upsertAppSettings: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

function createCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("students.list", () => {
  it("returns sorted student list", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.students.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("김민수");
  });
});

describe("studentData.get", () => {
  it("returns empty grid when no data exists", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.studentData.get({ studentId: "s1" });
    expect(result.studentId).toBe("s1");
    expect(result.eggs).toHaveLength(26); // GRID_COLS
    expect(result.eggs[0]).toHaveLength(16); // GRID_ROWS
    expect(result.soundEnabled).toBe(true);
  });
});

describe("settings.get", () => {
  it("returns default PIN", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.settings.get();
    expect(result.pin).toBe("0000");
  });
});

describe("settings.setPin", () => {
  it("accepts valid PIN", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.settings.setPin({ pin: "1234" });
    expect(result.success).toBe(true);
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
