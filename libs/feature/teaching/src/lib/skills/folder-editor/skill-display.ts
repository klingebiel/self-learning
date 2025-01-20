import { findParentsOfCycledSkills } from "@e-learning-by-sse/nm-skill-lib";
import {
	SkillFormModel,
	skillFormSchema,
	SkillRepositoryTreeNodeModel
} from "@self-learning/types";
import { OnDialogCloseFn } from "@self-learning/ui/common";

export type SkillSelectHandler = OnDialogCloseFn<string>;

export type OptionalVisualizationWithRequiredId = Pick<SkillFolderVisualization, "id"> &
	Partial<Omit<SkillFolderVisualization, "id">>;

export type UpdateVisuals = (skills: OptionalVisualizationWithRequiredId[] | null) => void;

export type SkillFolderVisualization = {
	id: string;
	isSelected: boolean;
	isCycleMember: boolean;
	hasNestedCycleMembers: boolean;
	skill: SkillRepositoryTreeNodeModel;
	isExpanded: boolean;
	children: string[];
	numberChildren: number;
	shortHighlight: boolean;
	isFolder: boolean;
	isRepository: boolean;
	displayName?: string; // alt name for display. Preffered over skill.name
	massSelected?: boolean;
};

export const visualSkillDefaultValues = {
	isSelected: false,
	massSelected: false,
	isCycleMember: false,
	hasNestedCycleMembers: false,
	isExpanded: false,
	shortHighlight: false
};

export const isSkillFormModel = (skill: SkillRepositoryTreeNodeModel): skill is SkillFormModel => {
	return skillFormSchema.safeParse(skill).success;
};

const inferInformationFromSkill = (
	skill: SkillRepositoryTreeNodeModel,
	skills: Map<string, SkillRepositoryTreeNodeModel>
) => {
	const children = isSkillFormModel(skill)
		? skill.children
		: Array.from(skills.values())
				.filter(sk => isSkillFormModel(sk))
				.filter(sk => sk.parents.length === 0)
				.filter(sk => sk.repositoryId === skill.id)
				.map(sk => sk.id);

	return {
		isFolder: isSkillFormModel(skill) ? skill.children.length > 0 : true,
		isRepository: !isSkillFormModel(skill),
		numberChildren: children.length,
		id: skill.id,
		children: children,
		skill
	};
};

/**
 *
 * @param skill the skill to be visualized
 * @param existingData any data that should be used as a base for the visualization.
 * @returns
 */
export const createDisplayData = (
	skill: SkillRepositoryTreeNodeModel,
	skills: Map<string, SkillRepositoryTreeNodeModel>,
	existingData?: Partial<SkillFolderVisualization>
): SkillFolderVisualization => {
	return {
		...visualSkillDefaultValues,
		...existingData,
		...inferInformationFromSkill(skill, skills)
	};
};

export function changeDisplay({
	displayUpdate,
	skills,
	historicDisplayData
}: {
	displayUpdate: OptionalVisualizationWithRequiredId[] | null;
	skills: Map<string, SkillRepositoryTreeNodeModel>;
	historicDisplayData: Map<string, SkillFolderVisualization>;
}) {
	const initialData = {
		displayData: new Map<string, SkillFolderVisualization>(historicDisplayData),
		ignoredData: [] as OptionalVisualizationWithRequiredId[]
	};

	if (!displayUpdate) {
		return initialData;
	}

	return displayUpdate.reduce((acc, updateData) => {
		const oldVisual = historicDisplayData.get(updateData.id);
		const skillData = skills.get(updateData.id);
		if (skillData) {
			acc.displayData.set(
				updateData.id,
				createDisplayData(skillData, skills, { ...oldVisual, ...updateData })
			);
		} else {
			acc.ignoredData.push(updateData);
		}
		return acc;
	}, initialData);
}

export const switchSelectionDisplayValue = (
	previousSelectionId: string | undefined,
	newSelectionId: string | undefined
): OptionalVisualizationWithRequiredId[] => {
	const idPropertiesMap: { [key: string]: Partial<SkillFolderVisualization> } = {};

	if (previousSelectionId) {
		idPropertiesMap[previousSelectionId] = { isSelected: false };
	}

	if (newSelectionId) {
		idPropertiesMap[newSelectionId] = { shortHighlight: true, isSelected: true };
	}

	return Object.entries(idPropertiesMap).map(([id, properties]) => ({ id, ...properties }));
};

export function getCycleDisplayInformation(skills: Map<string, SkillRepositoryTreeNodeModel>) {
	const justSkills = Array.from(skills.values()).filter(skill => isSkillFormModel(skill));
	const libSkills = justSkills.map(skill => ({
		...skill,
		nestedSkills: skill.children
	}));
	const cycleParents = findParentsOfCycledSkills(libSkills);
	if (!cycleParents) return [];
	const children = cycleParents.nestingSkills.map(cycle => ({
		...cycle,
		hasNestedCycleMembers: true
	}));
	const parents = cycleParents.cycles.flat().map(cycle => ({ ...cycle, isCycleMember: true }));
	return [...children, ...parents];
}
