import { createTRPCRouter } from "~/server/api/trpc";
import { authentication } from "~/server/api/routers/authentication";
import { rooms } from "./routers/room";
import { conversations } from "./routers/coversations";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  authentication,
  rooms,
  conversations,
});

// export type definition of API
export type AppRouter = typeof appRouter;
