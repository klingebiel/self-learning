import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { SkillRepositoryModel, skillRepositorySchema } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function RepositoryInfoForm({ repository }: { repository: SkillRepositoryModel }) {
	const { t } = useTranslation();
	const form = useForm({
		defaultValues: repository,
		resolver: zodResolver(skillRepositorySchema)
	});
	const errors = form.formState.errors;

	const { mutateAsync: changeRep } = trpc.skill.updateRepo.useMutation();

	const onSubmit = async (data: SkillRepositoryModel) => {
		try {
			await changeRep({ rep: data, repoId: data.id ?? "0" });
			showToast({
				type: "success",
				title: t("skill_network_saved"),
				subtitle: ""
			});
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: t("skill_network_error"),
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
						title={t("skill_network")}
						subtitle={t("skill_network_text")}
					/>
					<div className="flex flex-col gap-4">
						<LabeledField label="Name" error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label={t("description")} error={errors.description?.message}>
							<input
								type="text"
								className="textfield"
								{...form.register("description")}
							/>
						</LabeledField>
						<div className="flex justify-between">
							<button type="submit" className="btn-primary w-full">
								{t("save")}
							</button>
						</div>
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

export const RepositoryInfoMemorized = memo(RepositoryInfoForm);
