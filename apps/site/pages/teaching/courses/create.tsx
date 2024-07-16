import { trpc } from "@self-learning/api-client";
import { CourseEditor, CourseFormModel } from "@self-learning/teaching";
import { showToast } from "@self-learning/ui/common";
import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function CreateCoursePage() {
	const { mutateAsync: createCourse } = trpc.course.create.useMutation();
	const { mutateAsync: addCourse } = trpc.specialization.addCourse.useMutation();
	const router = useRouter();
	const { specializationId } = router.query;
	const { subjectId } = router.query;
	const session = useRequiredSession();
	const author = session.data?.user.name;
	const { t } = useTranslation();

	async function onConfirm(course: CourseFormModel) {
		try {
			const { title, slug, courseId } = await createCourse(course);

			await addCourse({
				subjectId: subjectId as string,
				specializationId: specializationId as string,
				courseId: courseId
			});

			showToast({ type: "success", title: t("course_created"), subtitle: title });
			router.push(`/courses/${slug}`);
		} catch (error) {
			console.error(error);
			showToast({
				type: "error",
				title: t("error"),
				subtitle: JSON.stringify(error, null, 2)
			});
		}
	}

	if (!author) {
		return <Unauthorized>{t("unauthorized")}</Unauthorized>;
	}

	return (
		<>
			{router.isReady && ( // Query params are not available on first render -> Wait for router to be ready
				<CourseEditor
					onConfirm={onConfirm}
					course={{
						courseId: "",
						title: "",
						slug: "",
						description: "",
						subtitle: "",
						imgUrl: "",
						subjectId: null,
						content: [],
						authors: [{ username: author }]
					}}
				/>
			)}
		</>
	);
}
