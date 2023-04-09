import { TRPCError } from "@trpc/server";
import { OpenAIApi, Configuration } from "openai";
import { Message } from "postcss";
import { z } from "zod";
import { authProcedure, createTRPCRouter } from "~/server/api/trpc";
import { prisma } from "~/server/db";
const api = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_KEY as string })
);
export const conversations = createTRPCRouter({
  askQuestion: authProcedure
    .input(
      z.object({
        question: z.string().min(1),
        roomId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId } = input;
      const last14Messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { messageId: "desc" },
        take: 16,
      });
      const last14MessagesReverse = [...last14Messages].reverse();
      let conversation = ``;

      last14MessagesReverse.map((message) => {
        if (message.writer === "you") {
          conversation += `question:-${message.text}?
`;
        } else {
          conversation += `answer:-${message.text}
`;
        }
      });
      conversation += `question:-${input.question}?
answer:-`;
      const res = await api.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: conversation,
          },
        ],
        max_tokens: 150,
      });
      const [newQuestion, newAnswer] = await prisma.$transaction([
        prisma.message.create({
          data: {
            roomId,
            text: input.question,
            writer: "you",
          },
        }),
        prisma.message.create({
          data: {
            roomId,
            writer: "server",
            text: res.data.choices[0]?.message?.content as string,
          },
        }),
      ]);
      return newAnswer;
    }),
  //check if every auth can excess this or not
  infiniteMessage: authProcedure
    .input(z.object({ roomId: z.number(), cursor: z.number().optional() }))

    .query(({ input }) => {
      const { roomId, cursor: cursorId } = input;
      /*
       * When cursor exists
       */
      if (!cursorId) {
        return prisma.message.findMany({
          where: { roomId },
          take: 14,
          orderBy: [{ messageId: "desc" }],
        });
      }
      /*
       * When cursor does not exits
       */
      return prisma.message.findMany({
        where: { roomId },
        orderBy: [{ messageId: "desc" }],
        cursor: { messageId: cursorId },
        skip: 1,
        take: 14,
      });
    }),
});
