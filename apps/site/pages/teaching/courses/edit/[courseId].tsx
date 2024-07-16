import { Prisma } from "@prisma/client";
import { authOptions } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

type EditCourseProps = {
	course: CourseFormModel;
	lessons: { title: string; lessonId: string; slug: string; meta: Prisma.JsonValue }[];
};

export const getServerSideProps: GetServerSideProps<EditCourseProps> = async ctx => {
	const courseId = ctx.params?.courseId as string;

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

	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	if (
		session.user.role !== "ADMIN" &&
		(!session.user.isAuthor ||
			!course.authors.some(author => author.username === session.user.name))
	) {
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

	const lessonsById = new Map<string, typeof lessons[0]>();

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
		props: { course: courseFormModel, lessons }
	};
};

export default function EditCoursePage({ course, lessons }: EditCourseProps) {
	const { mutateAsync: updateCourse } = trpc.course.edit.useMutation();
	const router = useRouter();
	const trpcContext = trpc.useContext();
	const isInitialRender = useRef(true);
	const { t } = useTranslation();

	if (isInitialRender.current) {
		isInitialRender.current = false;

		// Populate query cache with existing lessons
		// This way, we only need to fetch newly added lessons
		for (const lesson of lessons) {
			trpcContext.lesson.findOne.setData({ lessonId: lesson.lessonId }, lesson as any);
		}
	}

	function onConfirm(updatedCourse: CourseFormModel) {
		async function update() {
			try {
				const { title } = await updateCourse({
					courseId: course.courseId as string,
					course: updatedCourse
				});
				showToast({ type: "success", title: t("changed_success"), subtitle: title });
				router.replace(router.asPath, undefined, { scroll: false });
			} catch (error) {
				showToast({
					type: "error",
					title: t("error"),
					subtitle: JSON.stringify(error, null, 2)
				});
			}
		}
		update();
	}

	return <CourseEditor course={course} onConfirm={onConfirm} />;
}
