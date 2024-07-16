import { SkillFormModel } from "@self-learning/types";
import {
	ButtonActions,
	dispatchDialog,
	freeDialog,
	showToast,
	SimpleDialog
} from "@self-learning/ui/common";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { trpc } from "@self-learning/api-client";
import { Skill } from "@prisma/client";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const withErrorHandling = async (fn: () => Promise<void>) => {
	try {
		await fn();
		showToast({
			type: "success",
			title: i18next.t("action_success"),
			subtitle: ""
		});
	} catch (error) {
		if (error instanceof Error) {
			showToast({
				type: "error",
				title: i18next.t("action_error"),
				subtitle: error.message ?? ""
			});
		}
		console.log("Could not change skill:", error);
	}
};

export function AddChildButton({
	parentSkill,
	updateSkillDisplay,
	handleSelection,
	skillDefaults
}: {
	parentSkill: SkillFormModel;
	updateSkillDisplay: UpdateVisuals;
	handleSelection: SkillSelectHandler;
	skillDefaults?: Partial<Skill>;
}) {
	const { t } = useTranslation();
	const { mutateAsync: addSkillOnParent } = trpc.skill.createSkillWithParents.useMutation();
	const newSkill = {
		name: `${parentSkill.children.length + 1}. ${t("child")} - ${parentSkill.name}`,
		description: "Add here",
		children: [],
		parents: [parentSkill.id],
		repositoryId: parentSkill.repositoryId,
		...skillDefaults
	};
	const handleAddSkill = async () =>
		await withErrorHandling(async () => {
			const result = await addSkillOnParent({
				repoId: parentSkill.repositoryId,
				parentSkillId: parentSkill.id,
				skill: newSkill
			});
			if (result) {
				const { createdSkill, parentSkill } = result;
				updateSkillDisplay([
					{ id: createdSkill.id, shortHighlight: true },
					{
						id: parentSkill.id,
						shortHighlight: true,
						isExpanded: true
					}
				]);
				handleSelection(createdSkill.id);
			} else {
				throw new Error("Could not create skill");
			}
		});

	return (
		<button
			title={t("create_skill_group")}
			className="hover:text-secondary"
			onClick={handleAddSkill}
		>
			<FolderPlusIcon className="icon h-5 text-lg" style={{ cursor: "pointer" }} />
		</button>
	);
}

export function SkillDeleteOption({
	skillIds,
	className,
	onDeleteSuccess
}: {
	skillIds: SkillFormModel["id"][];
	className?: string;
	onDeleteSuccess?: () => void | PromiseLike<void>;
}) {
	const { t } = useTranslation();
	const { mutateAsync: deleteSkills } = trpc.skill.deleteSkills.useMutation();

	const onClose = async () => {
		await withErrorHandling(async () => {
			await deleteSkills({ ids: skillIds });
			await onDeleteSuccess?.();
		});
	};

	const handleDelete = () => {
		dispatchDialog(
			<SimpleDialog
				name={t("warning")}
				onClose={async (type: ButtonActions) => {
					if (type === ButtonActions.CANCEL) {
						freeDialog("simpleDialog");
						return;
					}
					onClose();
					freeDialog("simpleDialog");
				}}
			>
				{skillIds.length > 1
					? t("skill_delete_message_single")
					: t("skill_delete_message_plural")}
			</SimpleDialog>,
			"simpleDialog"
		);
	};

	return (
		<button
			type="button"
			className={` ${
				className
					? className
					: "rounded-lg border border-light-border bg-red-400 px-2 py-2 hover:bg-red-600"
			}`}
			onClick={handleDelete}
		>
			<TrashIcon className="h-5 " style={{ cursor: "pointer" }} />
		</button>
	);
}

export function NewSkillButton({
	repoId,
	onSuccess,
	skillDefaults
}: {
	repoId: string;
	onSuccess?: (skill: Skill) => void | Promise<void>;
	skillDefaults?: Partial<Skill>;
}) {
	const { t } = useTranslation();
	const { mutateAsync: createNewSkill } = trpc.skill.createSkill.useMutation();

	const date = new Date();
	const formattedDate = date.toLocaleDateString("de-DE");

	const newSkill = {
		name: `${t(
			"skill_from"
		)} ${formattedDate}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
		description: "Add here",
		children: [],
		...skillDefaults
	};
	const onCreateSkill = async () => {
		const createdSkill = await createNewSkill({
			repoId: repoId,
			skill: newSkill
		});
		await onSuccess?.(createdSkill ?? null);
	};
	return (
		<button className="btn-primary" onClick={onCreateSkill}>
			<PlusIcon className="icon h-5" />
			<span>{t("add_skill")}</span>
		</button>
	);
}
