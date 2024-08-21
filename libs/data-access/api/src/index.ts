export * from "./lib/trpc/app.router";
export * from "./lib/trpc/trpc";
export * from "./lib/auth";
export * from "./lib/trpc/routers/learningDiaryEntry.router";
export * from "./lib/trpc/routers/enrollment.router";

// TODO maybe find a better place for those types
export type { SkillResolved, SkillUnresolved } from "./lib/trpc/routers/skill.router";
