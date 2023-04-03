import { createTRPCRouter } from "~/server/api/trpc";
import { authentication } from "~/server/api/routers/authentication";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  authentication,
});

// export type definition of API
export type AppRouter = typeof appRouter;
