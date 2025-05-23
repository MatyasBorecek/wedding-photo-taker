import {z} from 'zod';

export const photoCreateSchema = z.object({
  isPublic: z.boolean().default(false)
});