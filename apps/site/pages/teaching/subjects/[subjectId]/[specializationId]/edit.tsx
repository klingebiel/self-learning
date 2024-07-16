import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { SpecializationEditor } from "../create";
import { useTranslation } from "react-i18next";

export default function SpecializationEditPage() {
	useRequiredSession();
	const { t } = useTranslation();
	const router = useRouter();
	const { subjectId, specializationId } = router.query;
	const { mutateAsync: updateSpecialization } = trpc.specialization.update.useMutation();

	const { data: specialization } = trpc.specialization.getForEdit.useQuery(
		{ specializationId: specializationId as string },
		{ enabled: !!specializationId }
	);

	const onSubmit: Parameters<typeof SpecializationEditor>[0]["onSubmit"] = async specFromForm => {
		try {
			console.log("Creating specialization", specFromForm);
			const spec = await updateSpecialization({
				subjectId: subjectId as string,
				data: specFromForm
			});

			showToast({
				type: "success",
				title: t("specialization_changed"),
				subtitle: spec.title
			});
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: t("error"), subtitle: error.message });
			}
		}
	};

	return (
		<div className="bg-gray-50">
			{specialization && (
				<SpecializationEditor onSubmit={onSubmit} initialSpecialization={specialization} />
			)}
		</div>
	);
}
