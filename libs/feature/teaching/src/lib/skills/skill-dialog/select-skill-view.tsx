import { AddButton, TransparentDeleteButton } from "@self-learning/ui/common";
import { SelectSkillDialog } from "./select-skill-dialog";
import { useState } from "react";
import { SkillFormModel } from "@self-learning/types";
import { LabeledField } from "@self-learning/ui/forms";
import { useTranslation } from "react-i18next";

export function LabeledFieldSelectSkillsView({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId,
	lable
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
	lable: string;
}) {
	const [selectSkillModal, setSelectSkillModal] = useState<boolean>(false);
	const { t } = useTranslation();

	return (
		<LabeledField
			label={lable}
			button={
				<AddButton
					onAdd={() => setSelectSkillModal(true)}
					title={t("add")}
					data-testid={t("needed_skills")}
					label={<span>{t("add")}</span>}
				/>
			}
		>
			<SkillManagementComponent
				skills={skills}
				setSelectSkillModal={setSelectSkillModal}
				onAddSkill={onAddSkill}
				selectSkillModal={selectSkillModal}
				onDeleteSkill={onDeleteSkill}
				repoId={repoId}
			></SkillManagementComponent>
		</LabeledField>
	);
}

export function SelectSkillsView({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
}) {
	const [selectSkillModal, setSelectSkillModal] = useState(false);
	const { t } = useTranslation();

	return (
		<>
			<AddButton
				onAdd={() => setSelectSkillModal(true)}
				title={t("add")}
				data-testid={t("needed_skills")}
				label={<span>{t("add")}</span>}
			/>
			<SkillManagementComponent
				skills={skills}
				setSelectSkillModal={setSelectSkillModal}
				onAddSkill={onAddSkill}
				selectSkillModal={selectSkillModal}
				onDeleteSkill={onDeleteSkill}
				repoId={repoId}
			></SkillManagementComponent>
		</>
	);
}

function SkillManagementComponent({
	skills,
	onDeleteSkill,
	onAddSkill,
	repoId,
	setSelectSkillModal,
	selectSkillModal
}: {
	skills: SkillFormModel[];
	onDeleteSkill: (skill: SkillFormModel) => void;
	onAddSkill: (skill: SkillFormModel[] | undefined) => void;
	repoId: string;
	setSelectSkillModal: (value: boolean | ((prevVar: boolean) => boolean)) => void;
	selectSkillModal: boolean;
}) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col">
			{skills.length === 0 && (
				<div className="mt-3 text-sm text-gray-500">{t("no_skills_available")}</div>
			)}
			<div className="mt-3 max-h-40 overflow-auto">
				{skills.map((skill, index) => (
					<InlineRemoveButton
						key={index}
						label={skill.name}
						onRemove={() => onDeleteSkill(skill)}
						onClick={() => {}} //TODO
					/>
				))}
			</div>
			{selectSkillModal && (
				<SelectSkillDialog
					onClose={skill => {
						setSelectSkillModal(false);
						onAddSkill(skill);
					}}
					repositoryId={repoId}
				/>
			)}
		</div>
	);
}

function InlineRemoveButton({
	label,
	onRemove,
	onClick
}: {
	label: string;
	onRemove: () => void;
	onClick: () => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="inline-block">
			<div className="flex items-center rounded-lg border border-light-border bg-white text-sm">
				<button
					className="flex flex-grow cursor-pointer flex-col px-4 hover:text-secondary"
					onClick={onClick}
					type="button"
				>
					{label}
				</button>
				<div className={"px-2 py-2"}>
					<TransparentDeleteButton onDelete={onRemove} title={t("delete_skill")} />
				</div>
			</div>
		</div>
	);
}
