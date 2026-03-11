import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllStudents, upsertStudent, deleteStudent,
  getStudentData, upsertStudentData,
  getAppSettings, upsertAppSettings,
} from "./db";
import { createEmptyEggs, createEmptyDates, createEmptyGoals } from "../shared/gridConstants";

const CLASS_ID = "default";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  students: router({
    list: publicProcedure.query(async () => {
      const rows = await getAllStudents(CLASS_ID);
      return rows.sort((a, b) => a.sortOrder - b.sortOrder);
    }),
    upsert: publicProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().min(1),
        sortOrder: z.number().int().default(0),
      }))
      .mutation(async ({ input }) => {
        await upsertStudent({ id: input.id, classId: CLASS_ID, name: input.name, sortOrder: input.sortOrder });
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteStudent(input.id);
        return { success: true };
      }),
  }),

  studentData: router({
    get: publicProcedure
      .input(z.object({ studentId: z.string() }))
      .query(async ({ input }) => {
        const data = await getStudentData(input.studentId);
        if (!data) {
          return { studentId: input.studentId, eggs: createEmptyEggs(), dates: createEmptyDates(), goals: createEmptyGoals(), soundEnabled: true };
        }
        return data;
      }),
    save: publicProcedure
      .input(z.object({
        studentId: z.string(),
        eggs: z.array(z.array(z.boolean())),
        dates: z.array(z.string()),
        goals: z.array(z.number()),
        soundEnabled: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await upsertStudentData(input.studentId, input.eggs, input.dates, input.goals, input.soundEnabled);
        return { success: true };
      }),
  }),

  settings: router({
    get: publicProcedure.query(async () => getAppSettings(CLASS_ID)),
    setPin: publicProcedure
      .input(z.object({ pin: z.string().min(4).max(10) }))
      .mutation(async ({ input }) => {
        await upsertAppSettings(CLASS_ID, input.pin);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
