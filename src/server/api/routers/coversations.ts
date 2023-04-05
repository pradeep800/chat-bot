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
      const roomInfo = await prisma.room.findUnique({
        where: { roomId: input.roomId },
      });

      let summery = "";
      if (roomInfo) {
        summery = `old qna summery is :-${roomInfo.summery} and your new question is :- ${input.question} most of the time use your own information but if needed give answer from old qna summery`;
      }

      const res = await api.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `${summery}  give answer as small as you can`,
          },
        ],
        max_tokens: 100,
      });

      const resText = res.data.choices[0]?.message?.content || "";
      if (!roomInfo) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      const newSummery = await api.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `write a summery for old qna:- ${roomInfo.summery} and new question ${input.question}  and answer is ${resText}  write summery as so you can understand whole context of before conversation`,
          },
        ],
        max_tokens: 150,
      });

      await prisma.$transaction([
        prisma.message.create({
          data: {
            roomId: input.roomId,
            text: input.question,
            writer: "you",
          },
        }),
        prisma.room.update({
          where: { roomId: input.roomId },
          data: {
            summery: newSummery.data.choices[0]?.message?.content,
          },
        }),
        prisma.message.create({
          data: {
            roomId: input.roomId,
            text: resText,
            writer: "server",
          },
        }),
      ]);

      return res.data;
    }),
  allMessageOfRoom: authProcedure
    .input(z.object({ roomId: z.number() }))
    .query(({ input }) => {
      console.log(input.roomId);
      return prisma.message.findMany({ where: { roomId: input.roomId } });
    }),
});
