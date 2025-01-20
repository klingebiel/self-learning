import { DialogHandler, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { SkillRepository } from "@prisma/client";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Skill } from "@prisma/client";
import { PlusIcon } from "@heroicons/react/24/solid";
import { AddSkillDialog } from "../skill-dialog/add-skill-dialog";
import { trpc } from "@self-learning/api-client";

export function SkillFolderTable({
	repository,
	skillDisplayData,
	selectedSkill,
	onSkillSelect: handleSelection,
	updateSkillDisplay
}: {
	repository: SkillRepository;
	skillDisplayData: Map<string, SkillFolderVisualization>;
	selectedSkill?: Skill;
	onSkillSelect: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const skillsToDisplay = useMemo(() => {
		const skills = Array.from(skillDisplayData.values());

		if (!searchTerm?.trim()) return skills;

		const normalizedSearchTerm = searchTerm.toLowerCase().trim();
		return skills.filter(
			skill =>
				skill.skill.name.toLowerCase().includes(normalizedSearchTerm) ||
				skill.displayName?.toLowerCase().includes(normalizedSearchTerm)
		);
	}, [skillDisplayData, searchTerm]);
	const [openNewSkillDialog, setOpenNewSkillDialog] = useState(false);
	const { mutateAsync: createNewSkill } = trpc.skill.createSkill.useMutation();
	const { mutateAsync: addSkillOnParent } = trpc.skill.createSkillWithParents.useMutation();

	function handleAddSkillDialogClose(result?: {
		name: string;
		description: string | null;
		parent?: string;
	}) {
		if (result) {
			let addSkill;
			if (result.parent) {
				const newSkill = {
					repoId: repository.id,
					parentSkillId: result.parent,
					skill: { ...result, children: [] }
				};
				addSkill = async () => await addSkillOnParent(newSkill);
			} else {
				const newSkill = {
					repoId: repository.id,
					skill: { ...result, children: [] }
				};
				addSkill = async () => {
					await createNewSkill(newSkill);
				};
			}

			addSkill();
			if (result.parent) {
				updateSkillDisplay([
					{
						id: result.parent,
						shortHighlight: true,
						isExpanded: true
					}
				]);
			}
		}
		setOpenNewSkillDialog(false);
	}

	// const setShortHighlight = (skill: Skill) =>
	// 	updateSkillDisplay([{ id: skill.id, shortHighlight: true }]);

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<RepositoryInfo repository={repository} />
					<button className="btn-primary" onClick={() => setOpenNewSkillDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Skill hinzufügen</span>
					</button>
					{openNewSkillDialog && (
						<AddSkillDialog
							repositoryId={repository.id}
							selectedSkill={selectedSkill}
							onClose={handleAddSkillDialogClose}
						/>
					)}
					{/* <NewSkillButton repoId={repository.id} onSuccess={setShortHighlight} /> */}
				</div>

				<SearchField
					placeholder="Suche nach Skill"
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>

				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Table
					head={
						<>
							{/* <th
								className={
									"font-semi-bold border-y border-light-border py-4 text-center text-sm"
								}
							>
								<input
									className="secondary form-checkbox rounded text-secondary focus:ring-secondary"
									type="checkbox"
									onChange={() => {}}
									checked={false}
								/>
							</th> */}
							<TableHeaderColumn>Bezeichnung</TableHeaderColumn>
							{/* <TableHeaderColumn>Fremd-Skill</TableHeaderColumn> */}
						</>
					}
				>
					{skillsToDisplay
						.sort(byChildrenLength)
						.filter(isTopLevelSkill)
						.map(element => (
							<ListSkillEntryWithChildren
								key={`${element.id}-0`}
								skillDisplayData={element}
								updateSkillDisplay={updateSkillDisplay}
								handleSelection={handleSelection}
								skillResolver={skillId => skillDisplayData.get(skillId)}
							/>
						))}
				</Table>
			</CenteredSection>
		</div>
	);
}

const byChildrenLength = (a: SkillFolderVisualization, b: SkillFolderVisualization) => {
	return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
};

const isTopLevelSkill = (skill: SkillFolderVisualization) => {
	// Remove "&& skill.hasNestedCycleMembers" from (skill.isCycleMember && skill.hasNestedCycleMembers)
	// To show the cycled skills in case no starting skill for the cycle
	// Ex: Skill1 => Skill2 => Skill3 => Skill

	// return skill.skill.parents.length === 0 || (skill.isCycleMember && skill.hasNestedCycleMembers);

	// return skill.skill.parents.length === 0 || skill.isCycleMember;

	return skill.isRepository || skill.isCycleMember;
};

function RepositoryInfo({ repository }: { repository: SkillRepository }) {
	const [showFullDescription, setShowFullDescription] = useState(false);

	const descLength = repository.description?.length ?? 0;
	const shouldShowMoreButton = !showFullDescription && descLength > 400;

	const displayedDescription = showFullDescription
		? repository.description
		: repository.description?.substring(0, 250);

	return (
		<div>
			<h1 className="text-5xl">{repository.name}</h1>
			<div className="mt-2 text-gray-500" style={{ maxWidth: "700px" }}>
				{displayedDescription}
				{shouldShowMoreButton && (
					<button
						onClick={() => setShowFullDescription(true)}
						className="pl-4 text-blue-500"
					>
						Mehr anzeigen
					</button>
				)}
			</div>
		</div>
	);
}
