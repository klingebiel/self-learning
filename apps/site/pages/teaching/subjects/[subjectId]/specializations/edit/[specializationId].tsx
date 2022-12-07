import { trpc } from "@self-learning/api-client";
import { showToast } from "@self-learning/ui/common";
import { TRPCClientError } from "@trpc/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SpecializationEditor } from "../create";

export default function SpecializationEditPage() {
	useSession({ required: true });
	const router = useRouter();
	const { subjectId, specializationId } = router.query;
	const { mutateAsync: updateSpecialization } = trpc.specialization.update.useMutation();
	const trpcContext = trpc.useContext();

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
			router.push(
				`/teaching/subjects/${subjectId}/specializations/edit/${spec.specializationId}`
			);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		} finally {
			trpcContext.invalidate();
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