import { TableDataColumn } from "@self-learning/ui/common";
import React from "react";
import {
	ChevronDownIcon,
	FolderIcon,
	ArrowPathRoundedSquareIcon,
	ShieldExclamationIcon,
	CircleStackIcon
} from "@heroicons/react/24/solid";
import { PencilIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { AddChildButton } from "./skill-taskbar";
import styles from "./folder-table.module.css";
import {
	isSkillFormModel,
	SkillFolderVisualization,
	SkillSelectHandler,
	UpdateVisuals
} from "./skill-display";
import { isTruthy } from "@self-learning/util/common";

export function ListSkillEntryWithChildren({
	skillResolver,
	skillDisplayData,
	depth = 0,
	handleSelection,
	updateSkillDisplay,
	renderedIds = new Set()
}: {
	skillResolver: (skillId: string) => SkillFolderVisualization | undefined;
	skillDisplayData: SkillFolderVisualization;
	depth?: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
	renderedIds?: Set<string>;
}) {
	const wasNotRendered = (skill: SkillFolderVisualization) => !renderedIds.has(skill.id);
	const showChildren = skillDisplayData.isExpanded ?? false;

	return (
		<>
			<SkillRow
				key={`${skillDisplayData.id}-${depth}`}
				skill={skillDisplayData}
				depth={depth}
				handleSelection={handleSelection}
				updateSkillDisplay={updateSkillDisplay}
			/>
			{showChildren &&
				skillDisplayData.children
					.map(childId => skillResolver(childId))
					.sort(byChildrenLength)
					.filter(isTruthy)
					.filter(wasNotRendered)
					.map(element => {
						// recursive structure to add <SkillRow /> for each child
						const newSet = new Set(renderedIds);
						newSet.add(element.id);
						return (
							<ListSkillEntryWithChildren
								key={`${element.id}-${depth + 1}`}
								skillDisplayData={element}
								updateSkillDisplay={updateSkillDisplay}
								skillResolver={skillResolver}
								handleSelection={handleSelection}
								depth={depth + 1}
								renderedIds={newSet}
							/>
						);
					})}
		</>
	);
}

const byChildrenLength = (
	a: SkillFolderVisualization | undefined,
	b: SkillFolderVisualization | undefined
) => {
	if (a && b) {
		return b.numberChildren - a.numberChildren || a.skill.name.localeCompare(b.skill.name);
	}
	return 0;
};

function SkillRow({
	skill,
	depth,
	handleSelection,
	updateSkillDisplay
}: {
	skill: SkillFolderVisualization;
	depth: number;
	handleSelection: SkillSelectHandler;
	updateSkillDisplay: UpdateVisuals;
}) {
	const depthCssStyle = {
		"--depth": depth
	} as React.CSSProperties;
	const onOpen = () => {
		// disables highlight effect after user interacted with the element
		const childrenDisplays = skill.children.map(cid => ({
			id: cid,
			shortHighlight: false
		}));
		updateSkillDisplay([
			...childrenDisplays,
			{ id: skill.id, isExpanded: !skill.isExpanded, shortHighlight: false }
		]);
	};

	let title = "";
	if (skill.isCycleMember) {
		title = "Dieser Skill ist Teil eines Zyklus.";
	} else if (skill.hasNestedCycleMembers) {
		title = "Dieser Ordner enthält einen Zyklus, ist aber kein Teil davon.";
	}
	const cycleError = skill.isCycleMember;
	const cycleWarning = skill.hasNestedCycleMembers && !skill.isSelected && !skill.isCycleMember;
	return (
		<tr
			style={depthCssStyle}
			title={title}
			className={`group cursor-pointer hover:bg-gray-100 ${cycleError ? "bg-red-100" : ""}
				${cycleWarning ? "bg-yellow-100" : ""}
				${skill.isSelected ? "bg-gray-200" : ""} `}
		>
			{/* <TableDataColumn className={"text-center align-middle"}>
				<input
					className="secondary form-checkbox rounded text-secondary focus:ring-secondary"
					type="checkbox"
					defaultChecked={false} // TODO mass select
				/>
			</TableDataColumn> */}

			<TableDataColumn
				className={`${styles["folder-line"]} ${
					skill.shortHighlight ? "animate-highlight rounded-md" : ""
				} text-sm font-medium`}
			>
				<div className={`flex px-2`}>
					<div
						className={`flex ${skill.isFolder && "hover:text-secondary"}`}
						onClick={() => handleSelection(skill.id)}
					>
						<div className="flex px-3">
							{skill.isFolder ? (
								<>
									<div className="mr-1">
										{skill.isExpanded ? (
											<ChevronDownIcon
												className=" icon h-5 text-lg"
												onClickCapture={() => onOpen()}
											/>
										) : (
											<ChevronDownIcon
												className="icon h-5 text-lg"
												onClickCapture={() => onOpen()}
											/>
										)}
									</div>
									{skill.isRepository ? (
										<CircleStackIcon className="icon h-5 text-lg" />
									) : (
										<FolderIcon className="icon h-5 text-lg" />
									)}
								</>
							) : (
								<div className="ml-6">
									<PuzzlePieceIcon className="icon h-5 text-lg" />
								</div>
							)}
						</div>
						{cycleError && (
							<ArrowPathRoundedSquareIcon className="icon h-5 text-lg text-red-500" />
						)}
						{cycleWarning && (
							<ShieldExclamationIcon className="icon h-5 text-lg text-yellow-500" />
						)}
						<span className={`${skill.isSelected ? "text-secondary" : ""}`}>
							{skill.displayName ?? skill.skill.name}
						</span>
						{/* <span className="ml-1 text-xs text-gray-500">{skill.skill.id}</span> */}
					</div>
					<div className="invisible  group-hover:visible">
						{/* <QuickEditButton onClick={() => handleSelection(skill.id)} skill={skill} /> */}
						<AddChildButton
							parentSkill={skill.skill}
							childrenNumber={skill.numberChildren}
							updateSkillDisplay={updateSkillDisplay}
							handleSelection={handleSelection}
						/>
						{/* <SkillDeleteOption
							skillIds={[skill.id]}
							className="px-2 hover:text-secondary"
						/> */}
					</div>
				</div>
			</TableDataColumn>
			{/* <TableDataColumn>{"nicht vorhanden"}</TableDataColumn> */}
		</tr>
	);
}

function QuickEditButton({
	onClick,
	skill
}: {
	onClick: () => void;
	skill: SkillFolderVisualization;
}) {
	return (
		<button
			title="Bearbeiten"
			className="mr-3 px-2 hover:text-secondary"
			onClick={onClick}
			disabled={skill.isSelected}
		>
			<PencilIcon className="ml-1 h-5 text-lg" />
		</button>
	);
}

const IconWithNumber: React.FC<{
	number: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({ number, children, style }) => (
	<div style={{ position: "relative" }}>
		{children}
		<span
			style={{
				position: "absolute",
				top: "50%",
				left: "10%",
				transform: "translate(-50%, -50%)",
				...style
			}}
		>
			{number}
		</span>
	</div>
);
