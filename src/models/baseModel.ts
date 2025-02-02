import { z } from "zod";

export const BaseModelSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BaseModel = z.infer<typeof BaseModelSchema>;
