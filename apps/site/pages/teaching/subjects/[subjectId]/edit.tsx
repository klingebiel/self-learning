import { trpc } from "@self-learning/api-client";
import { SubjectEditor } from "@self-learning/teaching";
import { Subject, subjectSchema } from "@self-learning/types";
import { LoadingBox, showToast } from "@self-learning/ui/common";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SubjectEditPage() {
	const { subjectId } = useRouter().query;
	const { data: subject } = trpc.subject.getForEdit.useQuery(
		{
			subjectId: subjectId as string
		},
		{
			enabled: !!subjectId // router query is undefined on first render
		}
	);
	const { mutateAsync: updateSubject } = trpc.subject.update.useMutation();

	async function onSubmit(subjectFromForm: Subject) {
		try {
			console.log("Updating subject", subjectFromForm);
			const res = await updateSubject(subjectFromForm);
			showToast({
				type: "success",
				title: "Fachgebiet aktualisiert",
				subtitle: `Das Fachgebiet "${res.title}" wurde aktualisiert.`
			});
		} catch (error) {
			console.error("Error updating subject", error);
		}
	}

	return (
		<div className="flex flex-col bg-gray-50">
			{!subject ? (
				<LoadingBox />
			) : (
				<SubjectEditor initialSubject={subjectSchema.parse(subject)} onSubmit={onSubmit} />
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
