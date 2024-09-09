import { authOptions } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { Quiz } from "@self-learning/quiz";
import { LessonEditor, LessonFormModel } from "@self-learning/teaching";
import { LessonContent } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type EditLessonProps = {
	lesson: LessonFormModel;
};

export const getServerSideProps: GetServerSideProps<EditLessonProps> = async ctx => {
	const lessonId = ctx.params?.lessonId;

	if (typeof lessonId !== "string") {
		throw new Error("No [lessonId] provided.");
	}

	const lesson = await database.lesson.findUnique({
		where: { lessonId },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			subtitle: true,
			description: true,
			content: true,
			quiz: true,
			imgUrl: true,
			licenseId: true,
			requirements: true,
			teachingGoals: true,
			authors: true,
			lessonType: true,
			selfRegulatedQuestion: true
		}
	});

	if (!lesson) {
		return { notFound: true };
	}

	const session = await getServerSession(ctx.req, ctx.res, authOptions);

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
		(!session.user.isAuthor || !lesson.authors.some(a => a.username === session.user.name))
	) {
		return {
			redirect: {
				destination: "/403",
				permanent: false
			}
		};
	}

	const lessonForm: LessonFormModel = {
		lessonId: lesson.lessonId,
		slug: lesson.slug,
		title: lesson.title,
		subtitle: lesson.subtitle,
		description: lesson.description,
		imgUrl: lesson.imgUrl,
		authors: lesson.authors,
		licenseId: lesson.licenseId,
		requirements: lesson.requirements.map(r => ({
			...r,
			children: [],
			parents: []
		})),
		teachingGoals: lesson.teachingGoals.map(t => ({
			...t,
			children: [],
			parents: []
		})),
		// Need type casting because JsonArray from prisma causes error
		content: (lesson.content ?? []) as LessonContent,
		quiz: lesson.quiz as Quiz,
		lessonType: lesson.lessonType,
		selfRegulatedQuestion: lesson.selfRegulatedQuestion
	};

	return {
		props: { lesson: lessonForm }
	};
};

export default function EditLessonPage({ lesson }: EditLessonProps) {
	const router = useRouter();
	const [localLesson, setLocalLesson] = useState<LessonFormModel | null>(null);
	const { mutateAsync: updateLesson } = trpc.lesson.edit.useMutation();
	const { fromPreview } = router.query;

	useEffect(() => {
		const storedLesson = localStorage.getItem("lessonInEditing");
		if (storedLesson && fromPreview) {
			setLocalLesson(JSON.parse(storedLesson));
		}
	}, []);

	async function onConfirm(updatedLesson: LessonFormModel) {
		try {
			const result = await updateLesson({
				lesson: updatedLesson,
				lessonId: lesson.lessonId as string
			});

			showToast({
				type: "success",
				title: "Änderungen gespeichert!",
				subtitle: result.title
			});
			// TODO remove lesson from local storage ?
			localStorage.removeItem("lessonInEditing");
			router.replace(router.asPath, undefined, { scroll: false });
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Das Speichern der Lerneinheit ist fehlgeschlagen. Siehe Konsole für mehr Informationen."
			});
		}
	}

	const lessonToEdit = localLesson || lesson;

	return <LessonEditor lesson={lessonToEdit} onConfirm={onConfirm} />;
}
