import type { Express } from "express";

// Standalone mode: OAuth routes disabled
export function registerOAuthRoutes(_app: Express) {
  // No-op: Manus OAuth not used in standalone deployment
}
