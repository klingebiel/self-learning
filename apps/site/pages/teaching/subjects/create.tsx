import { trpc } from "@self-learning/api-client";
import { SubjectEditor } from "@self-learning/teaching";
import { Subject } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { AdminGuard } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

export default function SubjectCreatePage() {
	const { mutateAsync: createSubject } = trpc.subject.create.useMutation();
	const router = useRouter();
	const { t } = useTranslation();

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Creating subject", subjectFromForm);
			const res = await createSubject(subjectFromForm);
			showToast({
				type: "success",
				title: t("created_subject"),
				subtitle: t("subject_created", { title: res.title })
			});
			router.push(`/teaching/subjects/edit/${res.subjectId}`);
		} catch (error) {
			console.error("Error creating subject", error);

			if (error instanceof TRPCClientError) {
				showToast({
					type: "error",
					title: t("error"),
					subtitle: error.message
				});
			}
		}
	}

	return (
		<AdminGuard error={<>{t("unauthorized_subject_error")}</>}>
			<div className="flex flex-col bg-gray-50">
				<SubjectEditor
					initialSubject={{
						subjectId: "",
						title: "",
						slug: "",
						subtitle: "",
						cardImgUrl: null,
						imgUrlBanner: null
					}}
					onSubmit={onSubmit}
				/>
			</div>
		</AdminGuard>
	);
}
