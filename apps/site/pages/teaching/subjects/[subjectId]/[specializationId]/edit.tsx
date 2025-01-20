import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { SpecializationEditor } from "../create";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SpecializationEditPage() {
	useRequiredSession();
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

			showToast({ type: "success", title: "Spezialisierung geändert", subtitle: spec.title });
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
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

export async function getServerSideProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"]))
		}
	};
}
