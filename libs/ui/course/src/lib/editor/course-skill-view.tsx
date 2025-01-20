import { trpc } from "@self-learning/api-client";
import { SkillFolderEditor } from "@self-learning/teaching";
import {
	SkillFormModel,
	skillFormSchema,
	SkillRepositoryModel,
	SkillRepositoryTreeNodeModel
} from "@self-learning/types";
import { isSkillFormModel } from "libs/feature/teaching/src/lib/skills/folder-editor/skill-display";
import { useEffect, useState } from "react";

export function CourseSkillView({
	repositories,
	repository
}: {
	repositories: SkillRepositoryModel[];
	repository: SkillRepositoryModel;
}) {
	return <div>{<SkillRepository repositories={repositories} repository={repository} />}</div>;
}

export function SkillRepository({
	repositories,
	repository
}: {
	repositories: SkillRepositoryModel[];
	repository: SkillRepositoryModel;
}) {
	const [selectedRepository, setSelectedRepository] = useState<SkillRepositoryModel>(repository);

	const updateSelectedRepository = (repository: SkillRepositoryModel) => {
		setSelectedRepository(repository);
	};

	const treeContent = new Map<string, SkillRepositoryTreeNodeModel>();

	repositories?.forEach(repo => {
		treeContent.set(repo.id, repo);
		const { data: skills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery({
			repoId: repo.id
		});
		skills?.forEach(skill => {
			treeContent.set(skill.id, skill);
		});
	});

	// skills?.forEach(skill => {
	// 	skillContent.set(skill.id, skill);
	// });

	// repositories.forEach(repo => {
	// 	const { data: skills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery({
	// 		repoId: repo.id
	// 	});
	// 	const repoId: string = "RPO." + repo.id;

	// 	const repoTopSkills: string[] = [];
	// 	skills?.forEach(skill => {
	// 		if (skill.parents.length === 0) {
	// 			repoTopSkills.push(skill.id);
	// 			skillContent.set(skill.id, { ...skill, parents: [repoId] });
	// 		} else {
	// 			skillContent.set(skill.id, skill);
	// 		}
	// 	});

	// 	const repoInSkillTree = {
	// 		id: repoId,
	// 		name: repo.name,
	// 		description: null,
	// 		repositoryId: "",
	// 		children: repoTopSkills,
	// 		parents: []
	// 	};

	// 	skillContent.set(repoId, repoInSkillTree);
	// });

	return (
		<div>
			<SkillFolderEditor
				repositories={repositories}
				repository={selectedRepository}
				skills={treeContent}
				updateSelectedRepository={updateSelectedRepository}
			/>
		</div>
	);
}
