import { z } from "zod";
import { BaseModelSchema } from "./baseModel";

const commonSchema = BaseModelSchema.extend({
  type: z.enum(["QUESTION", "ANSWER"]),
  chatId: z.string().nullable(),
  precededBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const answerModelSchema = commonSchema.extend({
  answer: z.string().nullable(),
  reasoning: z.string().nullable(),
  type: z.literal("ANSWER"),
});

export type AnswerModel = z.infer<typeof answerModelSchema>;

export const questionModelSchema = commonSchema.extend({
  question: z.string(),
  type: z.literal("QUESTION"),
});

export type QuestionModel = z.infer<typeof questionModelSchema>;

export const messageModelSchema = z.discriminatedUnion("type", [
  answerModelSchema,
  questionModelSchema,
]);

export type MessageModel = z.infer<typeof messageModelSchema>;

export function messageIsQuestion(
  message: MessageModel,
): message is QuestionModel {
  return message.type === "QUESTION";
}

export function messageIsAnswer(message: MessageModel): message is AnswerModel {
  return message.type === "ANSWER";
}
