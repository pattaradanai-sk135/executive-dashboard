// src/lib/validations/project.ts
import { z } from 'zod';

export const scoreCategorySchema = z.object({
  title: z.string(),
  score: z.number(),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  scoreBreakdown: z.array(scoreCategorySchema).optional(),
});

export const projectListSchema = z.array(projectSchema);