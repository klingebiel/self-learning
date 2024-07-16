import { useEffect, useState } from "react";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { SkillFormModel, skillFormSchema } from "@self-learning/types";
import { trpc } from "@self-learning/api-client";
import { SkillResolved } from "@self-learning/api";
import { SkillDeleteOption } from "./skill-taskbar";
import { showToast } from "@self-learning/ui/common";
import { SelectSkillsView } from "../skill-dialog/select-skill-view";
import { SkillSelectHandler } from "./skill-display";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export function SelectedSkillsInfoForm({
	skills,
	onSkillSelect
}: {
	skills: SkillFormModel[];
	onSkillSelect: SkillSelectHandler;
}) {
	if (skills.length > 0) {
		return <SkillInfoForm skill={skills[0]} handleSelection={onSkillSelect} />;
	} else {
		return <> </>;
	}
}

// export function MassSelectedInfo({
// 	skills,
// 	onSelectItem
// }: {
// 	skills: SkillFormModel[];
// 	onSelectItem: SkillSelectHandler;
// }) {
// 	return (
// 		<>
// 			<h2 className="text-xl">Ausgewählte Skills:</h2>
// 			<span className="pb-4 text-sm text-light">Die rechts ausgewählten Skills</span>

// 			<section className="flex h-64 flex-col overflow-auto rounded-lg border border-light-border">
// 				<div className="flex flex-col">
// 					{skills.map((skill, index) => (
// 						<span
// 							key={"span: " + skill.id + index}
// 							className="flex items-center gap-2 pl-1"
// 						>
// 							{skill.name}
// 						</span>
// 					))}
// 				</div>
// 			</section>
// 			<div className="pt-4" />
// 			<Divider />
// 			<SkillDeleteOption skills={skills} classname={"py-2 px-8"} onChange={() => {}} />
// 		</>
// 	);
// }

export function SkillInfoForm({
	skill,
	handleSelection
}: {
	skill: SkillFormModel;
	handleSelection: SkillSelectHandler;
}) {
	const { mutateAsync: updateSkill } = trpc.skill.updateSkill.useMutation();
	const { data: dbSkill } = trpc.skill.getSkillById.useQuery({
		skillId: skill.id
	});

	const { t } = useTranslation();
	const onSubmit = async (data: SkillFormModel) => {
		await updateSkill({
			skill: {
				...data,
				repositoryId: skill.repositoryId,
				id: skill.id,
				// don't use the form values. parents|children are changed from inside the dependency info component
				children: skill.children,
				parents: skill.parents
			}
		});

		showToast({
			type: "success",
			title: t("skill_saved"),
			subtitle: ""
		});
	};

	const form = useForm({
		defaultValues: skill,
		resolver: zodResolver(skillFormSchema)
	});
	const errors = form.formState.errors;
	form.setValue("name", skill.name);
	form.setValue("description", skill?.description);
	const resetEditTarget = () => handleSelection(undefined);

	return (
		<FormProvider {...form}>
			<form className="flex flex-col justify-between" onSubmit={form.handleSubmit(onSubmit)}>
				<Form.SidebarSection>
					<div className="flex justify-between">
						<Form.SidebarSectionTitle
							title={t("edit")}
							subtitle={t("skill_info_text")}
						/>
						<button
							type="button"
							className="h-fit rounded-lg border border-light-border bg-white px-2 py-2"
							title={t("close_without_change")}
							onClick={resetEditTarget}
						>
							<XMarkIcon className="h-5" />
						</button>
					</div>
					<div className="flex flex-col gap-4 border-b-2 border-light-border">
						<LabeledField label={t("name")} error={errors.name?.message}>
							<input type="text" className="textfield" {...form.register("name")} />
						</LabeledField>
						<LabeledField label={t("description")} error={errors.description?.message}>
							<textarea {...form.register("description")} />
						</LabeledField>
						<SkillToSkillDepsInfo
							parents={dbSkill?.parents ?? []}
							children={dbSkill?.children ?? []}
							repoId={skill.repositoryId}
							skillToChange={skill}
						/>
					</div>
					<div className="flex justify-between">
						<button type="submit" className="btn-primary w-full">
							{t("save")}
						</button>
						<SkillDeleteOption
							skillIds={[skill.id]}
							onDeleteSuccess={resetEditTarget}
						/>
					</div>
				</Form.SidebarSection>
			</form>
		</FormProvider>
	);
}

function SkillToSkillDepsInfo({
	parents,
	children,
	repoId,
	skillToChange
}: {
	parents: SkillResolved["parents"];
	children: SkillResolved["children"];
	repoId: string;
	skillToChange: SkillFormModel;
}) {
	const { t } = useTranslation();
	const [parentItems, setParentItems] = useState<SkillResolved["parents"]>(parents);
	const [childItems, setChildItems] = useState<SkillResolved["children"]>(children);
	const { setValue } = useFormContext<SkillFormModel>();

	useEffect(() => {
		setParentItems(parents);
	}, [parents]);

	useEffect(() => {
		setChildItems(children);
	}, [children]);

	const removeParent = (id: string) => {
		setParentItems(parentItems.filter(item => item.id !== id));
		skillToChange.parents = skillToChange.parents.filter(item => item !== id);
	};
	const removeChild = (id: string) => {
		setChildItems(childItems.filter(item => item.id !== id));
		skillToChange.children = skillToChange.children.filter(item => item !== id);
	};

	const addChildren = (skills: SkillFormModel[]) => {
		setChildItems([...childItems, ...skills]);
		skillToChange.children = [...skillToChange.children, ...skills.map(item => item.id)];
		setValue("children", skillToChange.children);
	};

	const addParent = (skills: SkillFormModel[]) => {
		setParentItems([...parentItems, ...skills]);
		skillToChange.parents = [...skillToChange.parents, ...skills.map(item => item.id)];
		setValue("parents", skillToChange.parents);
	};

	return (
		<>
			<label>
				<span className="text-sm font-semibold">{t("contains_skills")}</span>
			</label>
			<div>
				<SelectSkillsView
					skills={childItems.map(skill => {
						return {
							...skill,
							children: [],
							parents: [],
							repositoryId: repoId
						};
					})}
					onDeleteSkill={skill => {
						removeChild(skill.id);
					}}
					onAddSkill={skills => {
						if (!skills) return;
						addChildren(skills);
					}}
					repoId={repoId}
				/>
			</div>
			<label>
				<span className="text-sm font-semibold">{t("part_of_skills")}</span>
			</label>
			<div>
				<SelectSkillsView
					skills={parentItems.map(skill => {
						return {
							...skill,
							children: [],
							parents: [],
							repositoryId: repoId
						};
					})}
					onDeleteSkill={skill => {
						removeParent(skill.id);
					}}
					onAddSkill={skills => {
						if (!skills) return;
						addParent(skills);
					}}
					repoId={repoId}
				/>
			</div>
		</>
	);
}
