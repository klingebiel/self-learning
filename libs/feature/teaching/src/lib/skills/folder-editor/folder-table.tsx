import { DialogHandler, Table, TableHeaderColumn } from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection } from "@self-learning/ui/layouts";
import React, { useMemo, useState } from "react";
import { SkillRepository } from "@prisma/client";
import { ListSkillEntryWithChildren } from "./skill-row-entry";
import { NewSkillButton } from "./skill-taskbar";
import { SkillFolderVisualization, SkillSelectHandler, UpdateVisuals } from "./skill-display";
import { Skill } from "@prisma/client";
import { useTranslation } from "react-i18next";

export function SkillFolderTable({
	repository,
	skillDisplayData,
	onSkillSelect: handleSelection,
	updateSkillDisplay
}: {
	repository: SkillRepository;
	skillDisplayData: Map<string, SkillFolderVisualization>;
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

	const setShortHighlight = (skill: Skill) =>
		updateSkillDisplay([{ id: skill.id, shortHighlight: true }]);
	const { t } = useTranslation();

	return (
		<div>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<RepositoryInfo repository={repository} />
					<NewSkillButton repoId={repository.id} onSuccess={setShortHighlight} />
				</div>

				<SearchField
					placeholder={t("skill_tree_search")}
					onChange={e => {
						setSearchTerm(e.target.value);
					}}
				/>

				<DialogHandler id={"alert"} />
				<div className="pt-4" />
				<Table
					head={
						<>
							<th
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
							</th>
							<TableHeaderColumn>{t("designation")}</TableHeaderColumn>
							<TableHeaderColumn>{t("foreign_skill")}</TableHeaderColumn>
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
	return (
		b.skill.children.length - a.skill.children.length ||
		a.skill.name.localeCompare(b.skill.name)
	);
};

const isTopLevelSkill = (skill: SkillFolderVisualization) => {
	return skill.skill.parents.length === 0 || (skill.isCycleMember && skill.hasNestedCycleMembers);
};

function RepositoryInfo({ repository }: { repository: SkillRepository }) {
	const { t } = useTranslation();
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
						{t("show_more")}
					</button>
				)}
			</div>
		</div>
	);
}
