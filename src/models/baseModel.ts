import { ObjectId } from "mongodb";
import { z } from "zod";

export const BaseModelSchema = z.object({
  _id: z.instanceof(ObjectId),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BaseModel = z.infer<typeof BaseModelSchema>;
