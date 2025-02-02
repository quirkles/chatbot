import { z } from "zod";
import { BaseModelSchema } from "./baseModel";

export const chatModelSchema = BaseModelSchema.extend({
  chatName: z.string(),
});

export type ChatModel = z.infer<typeof chatModelSchema>;
