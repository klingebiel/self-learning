import { Author, Course, Lesson, Prisma, Skill } from "@prisma/client";
import { Quiz } from "@self-learning/quiz";
import {
	CourseContent,
	CourseMeta,
	createCourseMeta,
	createLessonMeta,
	LessonContent
} from "@self-learning/types";

export function createExampleCourse(
	courseId: string,
	content: CourseContent
): Prisma.CourseCreateInput {
	const course: Prisma.CourseCreateInput = {
		courseId,
		slug: courseId,
		title: `The ${courseId} Course`,
		subtitle: `This is a subtitle for ${courseId}.`,
		description: `This is a description for ${courseId}.`,
		imgUrl: null,
		content,
		meta: {}
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	course.meta = createCourseMeta(course as any);

	return course;
}

type ContentMockDefinition = {
	chapterTitle: string;
	lessons: string[];
}[];

export function createCourseMock({
	courseId,
	authors,
	content,
	slug,
	title,
	subtitle,
	description,
	meta
}: {
	courseId: string;
	authors: string[];
	content: ContentMockDefinition;
	slug?: string;
	title?: string;
	subtitle?: string;
	description?: string;
	meta?: CourseMeta;
}): Partial<Course> & { authors: Pick<Author, "username">[] } & { content: CourseContent } {
	return {
		courseId,
		slug: slug ?? courseId,
		title: title ?? courseId,
		subtitle: subtitle ?? undefined,
		description: description ?? null,
		authors: authors.map(author => ({ username: author })),
		content: content.map(chapter => ({
			title: chapter.chapterTitle,
			content: chapter.lessons.map(lessonId => ({ lessonId }))
		})),
		meta: meta ?? {
			lessonCount: content.reduce((acc, chapter) => acc + chapter.lessons.length, 0)
		}
	};
}

export function createLessonMock({
	lessonId,
	authors,
	slug,
	title,
	requirements,
	teachingGoals
}: {
	lessonId: string;
	authors: string[];
	slug?: string;
	title?: string;
	requirements?: Skill[];
	teachingGoals?: Skill[];
}): Partial<Lesson> &
	Pick<Lesson, "lessonId"> & { authors: Pick<Author, "username">[] } & {
		requirements: Skill[];
	} & { teachingGoals: Skill[] } {
	const defaultSkill: Skill = {
		id: "skill:1",
		name: "Skill1",
		description: "Skill1 description",
		repositoryId: "repo:1"
	};

	return {
		lessonId,
		slug: slug ?? lessonId,
		title: title ?? lessonId,
		subtitle: null,
		description: null,
		content: [
			{
				type: "article",
				value: { content: null }
			}
		],
		quiz: "Quiz",
		imgUrl: "imgUrl",
		licenseId: 1,
		requirements: requirements ?? [defaultSkill],
		teachingGoals: teachingGoals ?? [defaultSkill],
		authors: authors.map(author => ({ username: author })),
		selfRegulatedQuestion: null
	};
}

export function createExampleLessonsFromContent(
	content: CourseContent
): Prisma.LessonCreateManyInput[] {
	return content
		.flatMap(chapter => chapter.content)
		.map(lesson => createExampleLesson(lesson.lessonId));
}

export function createExampleLesson(
	lessonId: string,
	overwrites?: Partial<Lesson>
): Prisma.LessonCreateManyInput {
	const lesson: Prisma.LessonCreateManyInput = {
		lessonId: overwrites?.lessonId ?? lessonId,
		slug: overwrites?.slug ?? lessonId,
		title: overwrites?.title ?? "Lesson " + lessonId,
		subtitle: overwrites?.subtitle ?? `This is a subtitle for ${lessonId}.`,
		description: overwrites?.description ?? `This is a description for ${lessonId}.`,
		imgUrl: overwrites?.imgUrl ?? null,
		licenseId: 1,
		content:
			overwrites?.content ??
			([
				{
					type: "video",
					value: {
						url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
					},
					meta: {
						duration: 300
					}
				},
				{
					type: "article",
					value: {
						content: `# Hello World
lorem ipsum dolor sit amet.`
					},
					meta: {
						estimatedDuration: 500
					}
				}
			] as LessonContent),
		quiz:
			overwrites?.quiz ??
			({
				questions: [],
				config: null
			} satisfies Quiz),
		meta: Prisma.JsonNull
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	lesson.meta = createLessonMeta(lesson as any);

	return lesson;
}
