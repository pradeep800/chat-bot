import { z } from "zod";

import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
/*
 * TODO: Pagination
 */
export const rooms = createTRPCRouter({
  getAllRooms: authProcedure.query(async ({ ctx }) => {
    const rooms = await prisma.room.findMany({
      where: { userId: ctx.userInfo.userId },
      orderBy: [{ updatedAt: "desc" }],
    });
    return rooms;
  }),
  createRoom: authProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await prisma.room.create({
        data: {
          userId: ctx.userInfo.userId,
          title: input.title || "",
          summery: "",
        },
      });
      return room;
    }),
  editRoomTitle: authProcedure
    .input(z.object({ title: z.string(), roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const room = await prisma.room.update({
        where: { roomId: input.roomId },
        data: { title: input.title },
      });
      return room;
    }),
  deleteRoom: authProcedure
    .input(z.object({ roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const room = await prisma.room.delete({
        where: {
          roomId: input.roomId,
        },
      });
      return room;
    }),
});
