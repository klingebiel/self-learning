import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useCallback, useMemo, useState } from "react";
import { DialogHandler, Divider } from "@self-learning/ui/common";
import {
	SkillFormModel,
	SkillRepositoryModel,
	SkillRepositoryTreeNodeModel
} from "@self-learning/types";
import { RepositoryInfoMemorized } from "../repository/repository-edit-form";

import { SelectedSkillsInfoForm } from "./skill-edit-form";
import { ShowCyclesDialog } from "./cycle-detection/cycle-detection";
import {
	OptionalVisualizationWithRequiredId,
	SkillFolderVisualization,
	SkillSelectHandler,
	createDisplayData,
	switchSelectionDisplayValue,
	changeDisplay,
	getCycleDisplayInformation,
	isSkillFormModel
} from "./skill-display";
import { SkillRepository } from "@prisma/client";
import { SkillFolderTable } from "./folder-table";

export function SkillFolderEditor({
	repositories,
	repository,
	skills,
	updateSelectedRepository
}: {
	repositories: SkillRepository[];
	repository: SkillRepository;
	skills: Map<string, SkillRepositoryTreeNodeModel>;
	updateSelectedRepository: (repositoryId: SkillRepositoryModel) => void;
}) {
	const { skillDisplayData, updateSkillDisplay } = useTableSkillDisplay(skills);

	const [selectedItem, setSelectedItem] = useState<{
		previousSkill?: string;
		currentSkill?: string;
	}>({});

	const cycles = useMemo(() => {
		const cycleData = getCycleDisplayInformation(skills);
		updateSkillDisplay(cycleData);
		return cycleData;
	}, [skills, updateSkillDisplay]);

	const showCyclesDialog = cycles.length > 0;

	let selectedSkill = skills.get(selectedItem.currentSkill ?? "");
	if (selectedSkill) {
		selectedSkill = isSkillFormModel(selectedSkill) ? selectedSkill : undefined;
	}

	const changeEditTarget = useCallback(
		(skillId?: string) => {
			setSelectedItem(({ currentSkill: previousSelection }) => {
				if (skillId) {
					const selectedNode = skills.get(skillId);
					if (selectedNode && !isSkillFormModel(selectedNode)) {
						const repo = repositories.find(repo => repo.id === selectedNode?.id);
						if (repo) {
							updateSelectedRepository(repo);
							changeEditTarget(undefined);
						}
					} else {
						if (selectedNode?.repositoryId !== repository.id) {
							const repo = repositories.find(
								repo => repo.id === selectedNode?.repositoryId
							);
							if (repo) {
								updateSelectedRepository(repo);
							}
						}
					}
				}
				const visualsToUpdate = switchSelectionDisplayValue(previousSelection, skillId);
				updateSkillDisplay(visualsToUpdate);

				return {
					previousSkill: previousSelection,
					currentSkill: skillId
				};
			});
		},
		[updateSkillDisplay, repositories, updateSelectedRepository, skills]
	);

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<SidebarContentEditor
						skill={selectedSkill}
						changeEditTarget={changeEditTarget}
						repository={repository}
						updateSelectedRepository={updateSelectedRepository}
					/>
				}
			>
				{!!showCyclesDialog && <ShowCyclesDialog cycleParticipants={cycles} />}
				<SkillFolderTable
					repository={repository}
					skillDisplayData={skillDisplayData}
					selectedSkill={selectedSkill}
					onSkillSelect={changeEditTarget}
					updateSkillDisplay={updateSkillDisplay}
				/>
			</SidebarEditorLayout>
			<DialogHandler id={"simpleDialog"} />
		</div>
	);
}

function useTableSkillDisplay(skills: Map<string, SkillRepositoryTreeNodeModel>) {
	const [skillDisplayData, setSkillDisplayData] = useState(
		new Map<string, SkillFolderVisualization>()
	);

	const [displayBuffer, setDisplayBuffer] = useState<
		OptionalVisualizationWithRequiredId[] | null
	>();

	const updateSkillDisplay = useCallback(
		(displayUpdate: OptionalVisualizationWithRequiredId[] | null) => {
			setSkillDisplayData(historicDisplayData => {
				const { displayData, ignoredData: displayWithoutSkill } = changeDisplay({
					historicDisplayData,
					displayUpdate,
					skills
				});
				if (displayWithoutSkill.length > 0) {
					setDisplayBuffer(
						prev => prev?.concat(displayWithoutSkill) ?? displayWithoutSkill
					);
				}

				return displayData;
			});
		},
		[skills]
	);

	useMemo(() => {
		const checkNewItemBuffer = (skillId: string) =>
			displayBuffer?.filter(s => s.id === skillId)?.[0];
		const displayData = new Map<string, SkillFolderVisualization>();
		setSkillDisplayData(prev => {
			skills.forEach(skill => {
				const existingDisplayData = prev.get(skill.id) ?? checkNewItemBuffer(skill.id);
				displayData.set(skill.id, createDisplayData(skill, skills, existingDisplayData));
			});
			return displayData;
		});
	}, [skills, displayBuffer]);

	return { skillDisplayData, updateSkillDisplay };
}

function SidebarContentEditor({
	skill,
	changeEditTarget,
	repository,
	updateSelectedRepository
}: {
	skill?: SkillRepositoryTreeNodeModel;
	changeEditTarget: SkillSelectHandler;
	repository: SkillRepository;
	updateSelectedRepository: (repositoryId: SkillRepositoryModel) => void;
}) {
	return (
		<>
			<span className="text-2xl font-semibold text-secondary">Skillkarten editieren</span>

			<RepositoryInfoMemorized
				repository={repository}
				updateSelectedRepository={updateSelectedRepository}
			/>
			<Divider />

			{skill
				? isSkillFormModel(skill) && (
						<SelectedSkillsInfoForm
							skills={[skill]} // TODO check multiple skills
							onSkillSelect={changeEditTarget}
						/>
					)
				: "Einen Skill aus der Liste auswählen um das Bearbeiten zu starten..."}
		</>
	);
}
