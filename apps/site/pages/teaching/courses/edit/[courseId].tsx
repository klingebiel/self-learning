import { Prisma } from "@prisma/client";
import { withAuth } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useRef } from "react";
import { hasAuthorPermission } from "@self-learning/ui/layouts";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type EditCourseProps = {
	course: CourseFormModel;
	lessons: { title: string; lessonId: string; slug: string; meta: Prisma.JsonValue }[];
};

export const getServerSideProps: GetServerSideProps<EditCourseProps> = withAuth<EditCourseProps>(
	async (ctx, user) => {
		const courseId = ctx.params?.courseId as string;
		const { locale } = ctx;

		const course = await database.course.findUnique({
			where: { courseId },
			include: {
				authors: {
					select: {
						username: true
					}
				},
				specializations: {
					select: {
						specializationId: true
					}
				},
				subject: {
					select: {
						subjectId: true,
						title: true
					}
				}
			}
		});

		if (!course) {
			return {
				notFound: true
			};
		}

		if (!hasAuthorPermission({ user, permittedAuthors: course.authors.map(a => a.username) })) {
			return {
				redirect: {
					destination: "/403",
					permanent: false
				}
			};
		}

		const content = course.content as CourseContent;

		const lessonIds = extractLessonIds(content);

		const lessons = await database.lesson.findMany({
			where: { lessonId: { in: lessonIds } },
			select: {
				title: true,
				slug: true,
				lessonId: true,
				meta: true
			}
		});

		const lessonsById = new Map<string, (typeof lessons)[0]>();

		for (const lesson of lessons) {
			lessonsById.set(lesson.lessonId, lesson);
		}

		const courseFormModel: CourseFormModel = {
			title: course.title,
			courseId: course.courseId,
			description: course.description,
			subtitle: course.subtitle,
			imgUrl: course.imgUrl,
			slug: course.slug,
			subjectId: course.subject?.subjectId ?? null,
			authors: course.authors.map(author => ({ username: author.username })),
			content: content
		};

		return {
			notFound: !course,
			props: {
				course: courseFormModel,
				lessons,
				...(await serverSideTranslations(locale ?? "en", ["common"]))
			}
		};
	}
);

export default function EditCoursePage({ course, lessons }: EditCourseProps) {
	const { mutateAsync: updateCourse } = trpc.course.edit.useMutation();
	const router = useRouter();
	const trpcContext = trpc.useUtils();
	const isInitialRender = useRef(true);

	if (isInitialRender.current) {
		isInitialRender.current = false;

		// Populate query cache with existing lessons
		// This way, we only need to fetch newly added lessons
		for (const lesson of lessons) {
			trpcContext.lesson.findOne.setData({ lessonId: lesson.lessonId }, lesson);
		}
	}

	function onConfirm(updatedCourse: CourseFormModel) {
		async function update() {
			try {
				const { title } = await updateCourse({
					courseId: course.courseId as string,
					course: updatedCourse
				});
				showToast({ type: "success", title: "Änderung gespeichert!", subtitle: title });
				router.replace(router.asPath, undefined, { scroll: false });
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}

		update();
	}

	return <CourseEditor course={course} onConfirm={onConfirm} />;
}
