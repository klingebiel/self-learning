import { z } from "zod";

export const learningTechniqueEvaluationSchema = z.object({
	id: z.string().optional(),
	score: z.number().int().optional(),
	learningTechniqueId: z.string(),
	learningDiaryEntryId: z.string(),
	creatorName: z.string().optional()
});

export const learningGoalSchema: z.ZodSchema = z.lazy(() =>
	z.object({
		id: z.string().optional(),
		learningDiaryEntryId: z.string().uuid().optional(),
		parentGoalId: z.string().nullable().optional(),
		childGoals: z.array(z.lazy(() => learningGoalSchema)).optional()
	})
);

export const learningDiaryEntrySchema = z.object({
	id: z.string(),
	notes: z.string().optional(),
	effortLevel: z.number().int().optional(),
	distractionLevel: z.number().int().optional(),
	learningLocationId: z.string().optional(),
	learningGoals: z.array(learningGoalSchema).optional(),
	learningTechniqueEvaluation: z.array(learningTechniqueEvaluationSchema).optional()
});

export type LearningDiaryEntry = z.infer<typeof learningDiaryEntrySchema>;

export const createLearningDiaryEntrySchema = z.object({
	courseSlug: z.string().optional()
});

export const learningLocationSchema = z.object({
	id: z.string().optional().nullable(),
	name: z.string(),
	iconURL: z.string(),
	defaultLocation: z.boolean().default(false),
	creatorName: z.string().optional().nullable()
});

export const lessonStartSchema = z.object({
	entryId: z.string(),
	lessonId: z.string()
});