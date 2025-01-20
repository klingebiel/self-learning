import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { SkillRepositoryModel, skillRepositorySchema } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

function RepositoryInfoForm({
	repository,
	updateSelectedRepository
}: {
	repository: SkillRepositoryModel;
	updateSelectedRepository: (repositoryId: SkillRepositoryModel) => void;
}) {
	const form = useForm({
		defaultValues: repository,
		resolver: zodResolver(skillRepositorySchema)
	});

	useEffect(() => {
		form.reset({ ...repository });
	}, [form, repository]);

	const errors = form.formState.errors;

	const { mutateAsync: changeRep } = trpc.skill.updateRepo.useMutation();

	const onSubmit = async (data: SkillRepositoryModel) => {
		try {
			await changeRep({ rep: data, repoId: data.id ?? "0" });
			showToast({
				type: "success",
				title: "Skill Netzwerk gespeichert!",
				subtitle: ""
			});
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Aktuelles Skill Netzwerk konnte nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	};

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<Form.SidebarSectionTitle
						title="Skill Netzwerk"
						subtitle="Informationen über das Skill Netzwerk "
					/>
					<div className="flex flex-col gap-4">
						<LabeledField label="Name" error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label="Beschreibung" error={errors.description?.message}>
							<input
								type="text"
								className="textfield"
								{...form.register("description")}
							/>
						</LabeledField>
						<div className="flex justify-between">
							<button type="submit" className="btn-primary w-full">
								Speichern
							</button>
						</div>
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

export const RepositoryInfoMemorized = memo(RepositoryInfoForm);
