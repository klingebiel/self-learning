/* eslint-disable react/jsx-no-useless-fragment */
import { trpc } from "@self-learning/api-client";
import { SkillFormModel, SkillRepositoryModel } from "@self-learning/types";
import { Dialog, DialogActions, LoadingBox } from "@self-learning/ui/common";
import { Form, LabeledField } from "@self-learning/ui/forms";
import { memo, useEffect, useState } from "react";
import { SelectSkillDialog } from "../../skills/skill-dialog/select-skill-dialog";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { SelectSkillsView } from "../../skills/skill-dialog/select-skill-view";
import { ExtendedCourseFormModel } from "../../course/course-form-model";
import { IconButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

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
	selectRepository,
	withRepoEditor
}: {
	selectRepository: (id: SkillRepositoryModel) => void;
	withRepoEditor?: boolean;
}) {
	// TODO Make a method to get a smaller version of the repository
	const { data: repositories, isLoading } = trpc.skill.getRepositories.useQuery();

	const onChange = (id: string) => {
		const repository = repositories?.find(repository => repository.id === id);
		if (repository) {
			selectRepository(repository);
		}
	};

	const [openCreateDialog, setOpenCreateDialog] = useState(false);

	const onClose = () => {
		setOpenCreateDialog(false);
	};

	return (
		<>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{repositories && repositories.length > 0 && (
						<LabeledField label="Verlinkte Skill-Repositories">
							{withRepoEditor ? (
								<IconButton
									type="button"
									data-testid="author-add"
									onClick={() => setOpenCreateDialog(true)}
									title="Hinzufügen"
									text="Hinzufügen"
									icon={<PlusIcon className="h-5" />}
								/>
							) : null}
							<RepositoryDropDown repositories={repositories} onChange={onChange} />
						</LabeledField>
					)}
				</>
			)}
			{openCreateDialog && <NewSkillRepositoryDialog onClose={() => onClose()} />}
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

type CourseSkillModalIdentifier = "courseTeachingGoals" | "courseRequirements";

export function CourseSkillForm() {
	const { setValue, watch } = useFormContext<ExtendedCourseFormModel>();

	const watchingSkills = {
		courseRequirements: watch("courseRequirements"),
		courseTeachingGoals: watch("courseTeachingGoals")
	};

	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel | null>(null);
	const [selectSkillModal, setSelectSkillModal] = useState<{
		id: CourseSkillModalIdentifier;
	} | null>(null);

	const selectRepository = (id: SkillRepositoryModel) => {
		setSelectedRepository(id);
	};

	const addSkills = (skill: SkillFormModel[] | undefined, id: CourseSkillModalIdentifier) => {
		if (!skill) return;
		skill = skill.map(skill => ({ ...skill, children: [], parents: [] }));
		setValue(id, [...watchingSkills[id], ...skill]);
	};

	const deleteSkill = (skill: SkillFormModel, id: CourseSkillModalIdentifier) => {
		setValue(
			id,
			watchingSkills[id].filter(s => s.id !== skill.id)
		);
	};

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Skills bearbeiten"
				subtitle="Ziele und Voraussetzungen dieses Kurses"
			/>
			<LinkedSkillRepositoryMemorized
				selectRepository={selectRepository}
				withRepoEditor={true}
			/>
			{selectedRepository && (
				<>
					<LabeledField label="Vermittelte Skills">
						<SelectSkillsView
							skills={watchingSkills["courseTeachingGoals"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "courseTeachingGoals");
							}}
							onAddSkill={skill => {
								addSkills(skill, "courseTeachingGoals");
							}}
							repoId={selectedRepository.id}
						/>
					</LabeledField>
					<LabeledField label="Benötigte Skills">
						<SelectSkillsView
							skills={watchingSkills["courseRequirements"]}
							onDeleteSkill={skill => {
								deleteSkill(skill, "courseRequirements");
							}}
							onAddSkill={skill => {
								addSkills(skill, "courseRequirements");
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

type SkillRepository = {
	name: string;
	description: string;
};

function NewSkillRepositoryDialog({ onClose }: { onClose: () => void }) {
	const { mutateAsync: createNewSkillRepo } = trpc.skill.addRepo.useMutation();
	const session = useSession();

	async function createNewRepository(formData: SkillRepository) {
		if (session.data?.user.id) {
			const userId = session.data?.user.id;
			const newRepo = { ...formData, ownerId: userId };
			const respose = await createNewSkillRepo({ rep: newRepo });
			console.log("New skill repository created", respose);
		} else {
			console.error("Creation of a new skill repository failed - no user logged in");
		}
		onClose();
	}
	return (
		<Dialog onClose={() => onClose()} title={"Neue Skill Repository"}>
			<NewSkillRepositoryForm handleSubmit={createNewRepository} />
			<DialogActions onClose={onClose}>
				<button className="btn-primary" type="submit" form="skill-repository-form">
					Erstellen
				</button>
			</DialogActions>
		</Dialog>
	);
}

function NewSkillRepositoryForm({
	handleSubmit
}: {
	handleSubmit: (formData: SkillRepository) => void;
}) {
	const [formData, setFormData] = useState({
		name: "",
		description: ""
	});

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		handleSubmit(formData);
	}

	return (
		<form onSubmit={onSubmit} id="skill-repository-form">
			<LabeledField label="Name" error={""}>
				<input
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
				></input>
			</LabeledField>
			<LabeledField label="Beschreibung" error={""}>
				<input
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: e.target.value })}
				></input>
			</LabeledField>
		</form>
	);
}
