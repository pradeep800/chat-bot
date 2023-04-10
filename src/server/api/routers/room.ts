import { z } from "zod";
import { noOfRoomForPagination } from "~/staticVeriable/paginationRoom";
import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";
/*
 * TODO: Pagination
 */
export const rooms = createTRPCRouter({
  get15Rooms: authProcedure.query(async ({ ctx }) => {
    const rooms = await prisma.room.findMany({
      where: { userId: ctx.userInfo.userId },
      orderBy: [{ updatedAt: "desc" }],
      take: noOfRoomForPagination,
    });
    return rooms;
  }),
  getNext15Rooms: authProcedure
    .input(z.object({ cursorId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.cursorId) {
        return [];
      }
      const rooms = await prisma.room.findMany({
        where: { userId: ctx.userInfo.userId },
        skip: 1,
        orderBy: [{ updatedAt: "desc" }],
        cursor: {
          roomId: input.cursorId,
        },
        take: noOfRoomForPagination,
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
      const room = await prisma.room.update({
        where: { roomId: input.roomId },
        data: { title: input.title },
      });

      return room;
    }),
  deleteRoom: authProcedure
    .input(z.object({ roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { roomId } = input;
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
        take: 15,
      });
    }),
});
