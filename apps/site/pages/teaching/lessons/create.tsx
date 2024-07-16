import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { LessonEditor, LessonFormModel, onLessonCreatorSubmit } from "@self-learning/teaching";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { useTranslation } from "react-i18next";

export default function CreateLessonPage() {
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const router = useRouter();
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	const { t } = useTranslation();

	if (!authorUsername) {
		return <Unauthorized>{t("unit_unauthorized")}</Unauthorized>;
	}

	async function handleCreateClose(lesson?: LessonFormModel) {
		await onLessonCreatorSubmit(
			() => {
				router.push("/overview");
			},
			createLessonAsync,
			lesson
		);
	}

	return <LessonEditor onSubmit={handleCreateClose} isFullScreen={true} />;
}
