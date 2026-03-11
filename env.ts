export const ENV = {
  // JWT secret for session signing - hardcoded for standalone deployment
  cookieSecret: process.env.JWT_SECRET ?? "dino-egg-tracker-secret-key-2024-standalone",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Manus-specific fields kept as empty strings for compatibility
  appId: "",
  oAuthServerUrl: "",
  ownerOpenId: "",
  forgeApiUrl: "",
  forgeApiKey: "",
};
