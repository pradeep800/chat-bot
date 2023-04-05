import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";

export const authentication = createTRPCRouter({
  login: authProcedure.mutation(async ({ ctx }) => {
    try {
      await prisma.user.create({
        data: ctx.userInfo,
      });
    } catch (err) {
      console.log("already created user");
    }

    return ctx.userInfo;
  }),
});
