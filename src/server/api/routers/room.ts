import { z } from "zod";
import { noOfRoomForPagination } from "~/staticVeriable/variable";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { checkIfItsHisRoom } from "./coversations";
/*
 * TODO: Pagination
 */
export const rooms = createTRPCRouter({
  getRooms: authProcedure.query(async ({ ctx }) => {
    const rooms = await prisma.room.findMany({
      where: { userId: ctx.userInfo.userId },
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
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
      const { roomId } = input;
      const { userId } = ctx.userInfo;
      await checkIfItsHisRoom(roomId, userId);

      const room = await prisma.room.update({
        where: { roomId: roomId },
        data: { title: input.title },
      });

      return room;
    }),
  deleteRoom: authProcedure
    .input(z.object({ roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { roomId } = input;
      const { userId } = ctx.userInfo;
      await checkIfItsHisRoom(roomId, userId);
      const messages = await prisma.message.findMany({
        where: { roomId: roomId },
      });

      // Delete messages associated with the room

      await Promise.all(
        messages.map(async (message) => {
          await prisma.message.delete({
            where: { messageId: message.messageId },
          });
        })
      );

      // Delete the room
      const deletedRoom = await prisma.room.delete({
        where: { roomId: roomId },
      });
      return deletedRoom;
    }),
  searchRooms: authProcedure
    .input(z.object({ substring: z.string() }))
    .mutation(({ input, ctx }) => {
      const { substring } = input;
      const { userId } = ctx.userInfo;

      return prisma.room.findMany({
        where: { userId, title: { contains: substring } },
        orderBy: { updatedAt: "desc" },
        take: noOfRoomForPagination,
      });
    }),
  nextSearchRooms: authProcedure
    .input(z.object({ substring: z.string(), cursorId: z.number().optional() }))
    .mutation(({ ctx, input }) => {
      const { userId } = ctx.userInfo;
      const { cursorId: cursorId, substring } = input;
      return prisma.room.findMany({
        where: { userId, title: { contains: substring } },
        orderBy: { updatedAt: "desc" },
        cursor: { roomId: cursorId },
        skip: 1,
        take: noOfRoomForPagination,
      });
    }),
});
