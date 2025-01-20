import { Unauthorized, useRequiredSession } from "@self-learning/ui/layouts";
import { LessonEditor, LessonFormModel, onLessonCreatorSubmit } from "@self-learning/teaching";
import { useRouter } from "next/router";
import { trpc } from "@self-learning/api-client";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function CreateLessonPage() {
	const session = useRequiredSession();
	const authorUsername = session.data?.user.name;
	const router = useRouter();
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();
	if (!authorUsername) {
		return (
			<Unauthorized>Um eine Lerneinheit zu erstellen, musst du ein Autor sein.</Unauthorized>
		);
	}

	// This function is triggered when the Editor is closed.
	// It sets the TRPC mutation and the url where the user is directed after submission
	async function handleCreateClose(lesson?: LessonFormModel) {
		await onLessonCreatorSubmit(
			() => {
				router.push("/dashboard/author");
			},
			createLessonAsync,
			lesson
		);
	}

	return <LessonEditor onSubmit={handleCreateClose} isFullScreen={true} />;
}

export async function getServerSideProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"]))
		}
	};
}
