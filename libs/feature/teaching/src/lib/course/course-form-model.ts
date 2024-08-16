import { Prisma } from "@prisma/client";
import {
	authorsRelationSchema,
	courseContentSchema,
	createCourseMeta,
	skillFormSchema
} from "@self-learning/types";
import { stringOrNull } from "@self-learning/util/common";
import { z } from "zod";

export const courseFormSchema = z.object({
	courseId: z.string().nullable(),
	subjectId: z.string().nullable(),
	slug: z.string().min(3),
	title: z.string().min(3),
	subtitle: z.string().min(3),
	description: z.string().nullable(),
	imgUrl: z.string().nullable(),
	authors: authorsRelationSchema,
	content: courseContentSchema,
	specializationId: z.string().nullable().optional()
});

export const extendedCourseFormSchema = z.object({
	course: courseFormSchema,
	courseTeachingGoals: z.array(skillFormSchema),
	courseRequirements: z.array(skillFormSchema)
});

export type ExtendedCourseFormValues = {
	course: CourseFormModel;
	courseTeachingGoals: [];
	courseRequirements: [];
};

export type CourseFormModel = z.infer<typeof courseFormSchema>;
export type ExtendedCourseFormModel = z.infer<typeof extendedCourseFormSchema>;

export function mapCourseFormToInsert(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseCreateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId, authors } = course;

	const courseForDb: Prisma.CourseCreateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content: content,
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		meta: createCourseMeta(course),
		authors: {
			connect: authors.map(author => ({ username: author.username }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}

export function mapCourseFormToUpdate(
	course: CourseFormModel,
	courseId: string
): Prisma.CourseUpdateInput {
	const { title, slug, subtitle, description, imgUrl, content, subjectId, authors } = course;

	const courseForDb: Prisma.CourseUpdateInput = {
		courseId,
		slug,
		title,
		subtitle,
		content,
		imgUrl: stringOrNull(imgUrl),
		description: stringOrNull(description),
		meta: createCourseMeta(course),
		authors: {
			set: authors.map(author => ({ username: author.username }))
		},
		subject: subjectId ? { connect: { subjectId } } : undefined
	};

	return courseForDb;
}
export function createEmptyCourseFormModel(): CourseFormModel {
	return {
		courseId: null,
		subjectId: null,
		slug: "",
		title: "",
		subtitle: "",
		description: null,
		imgUrl: null,
		authors: [],
		content: [],
		specializationId: null
	};
}

export function createEmptyExtendedCourseFormModel(): ExtendedCourseFormModel {
	const emptyCourse = createEmptyCourseFormModel();
	return {
		course: emptyCourse,
		courseTeachingGoals: [],
		courseRequirements: []
	};
}
