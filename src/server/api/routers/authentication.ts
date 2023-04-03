import { z } from "zod";

import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const authentication = createTRPCRouter({
  login: authProcedure.query(({ ctx }) => {
    return ctx.userInfo;
  }),
});
