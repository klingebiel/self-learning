/* eslint-disable react/jsx-no-useless-fragment */
import { trpc } from "@self-learning/api-client";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo, useEffect, useState } from "react";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { SelectSkillsView } from "../../skills/skill-dialog/select-skill-view";
import { useRouter } from "next/router";

type SkillModalIdentifier = "teachingGoals" | "requirements";

export default function SkillForm() {
	const { setValue, watch } = useFormContext<LessonFormModel>();

	const watchingSkills = {
		requirements: watch("requirements"),
		teachingGoals: watch("teachingGoals")
	};

	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel | null>(null);
	const [selectSkillModal, setSelectSkillModal] = useState<{ id: SkillModalIdentifier } | null>(
		null
	);

	const selectRepository = (id: SkillRepositoryModel) => {
		setSelectedRepository(id);
	};

	const addSkills = (skill: SkillFormModel[] | undefined, id: SkillModalIdentifier) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: SkillModalIdentifier) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
	};

	const router = useRouter();
	const { query } = router;
	const [skillsFromPreview, setSkillsFromPreview] = useState<{
		teachingGoals: SkillFormModel[];
		requirements: SkillFormModel[];
	}>({ teachingGoals: [], requirements: [] });

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				if (storedData) {
					const lessonInEditing = JSON.parse(storedData);
					const teachingGoalsFromPreview = lessonInEditing.teachingGoals
						? lessonInEditing.teachingGoals
						: [];
					const requirementsFromPreview = lessonInEditing.requirements
						? lessonInEditing.requirements
						: [];
					setSkillsFromPreview({
						teachingGoals: teachingGoalsFromPreview,
						requirements: requirementsFromPreview
					});
				}
			}
		}
	}, [query]);

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (typeof window !== "undefined") {
				setValue("teachingGoals", skillsFromPreview.teachingGoals);
				setValue("requirements", skillsFromPreview.requirements);
			}
		}
	}, [skillsFromPreview]);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Skills"
				subtitle="Vermittelte und Benötigte Skills dieser Lerneinheit"
			/>
			<LinkedSkillRepositoryMemorized selectRepository={selectRepository} />
			{selectedRepository && (
				<>
					<LabeledField label="Vermittelte Skills">
						<SelectSkillsView
							skills={watchingSkills["teachingGoals"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "teachingGoals");
							}}
							onAddSkill={skill => {
								addSkills(skill, "teachingGoals");
							}}
							repoId={selectedRepository.id}
						/>
					</LabeledField>
					<LabeledField label="Benötigte Skills">
						<SelectSkillsView
							skills={watchingSkills["requirements"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "requirements");
							}}
							onAddSkill={skill => {
								addSkills(skill, "requirements");
							}}
							repoId={selectedRepository.id}
						/>
					</LabeledField>
					{selectSkillModal && (
						<SelectSkillDialog
							onClose={skill => {
								setSelectSkillModal(null);
								addSkills(skill, selectSkillModal.id);
							}}
							repositoryId={selectedRepository.id}
						/>
					)}
				</>
			)}
		</Form.SidebarSection>
	);
}

const LinkedSkillRepositoryMemorized = memo(LinkedSkillRepository);

function LinkedSkillRepository({
	selectRepository
}: {
	selectRepository: (id: SkillRepositoryModel) => void;
}) {
	// TODO Make a method to get a smaller version of the repository
	const { data: repositories, isLoading } = trpc.skill.getRepositories.useQuery();

	const onChange = (id: string) => {
		const repository = repositories?.find(repository => repository.id === id);
		if (repository) {
			selectRepository(repository);
		}
	};

	return (
		<>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{repositories && repositories.length > 0 && (
						<LabeledField label="Verlinkte Skill-Repositories">
							<RepositoryDropDown repositories={repositories} onChange={onChange} />
						</LabeledField>
					)}
				</>
			)}
		</>
	);
}

function RepositoryDropDown({
	repositories,
	onChange
}: {
	repositories: SkillRepositoryModel[];
	onChange: (id: string) => void;
}) {
	const [selectedRepository, setSelectedRepository] = useState<string>(repositories[0].id);

	const changeDisplaySelectedRepository = (id: string) => {
		setSelectedRepository(id);
	};

	useEffect(() => {
		onChange(selectedRepository);
	}, [onChange, selectedRepository]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedRepository ?? repositories[0].id}
				onChange={e => {
					changeDisplaySelectedRepository(e.target.value);
				}}
			>
				{repositories.map(repository => (
					<option key={repository.id} value={repository.id}>
						{repository.name}
					</option>
				))}
			</select>
		</div>
	);
}
