import z from "zod";
import { SkillResolved } from "@self-learning/database";

//zod scheme
export const skillCreationFormSchema = z.object({
	name: z.string(),
	description: z.string().nullable(),
	children: z.array(z.string())
});
export type SkillCreationFormModel = z.infer<typeof skillCreationFormSchema>;

export const skillFormSchema = skillCreationFormSchema.extend({
	id: z.string(),
	repositoryId: z.string(),
	parents: z.array(z.string())
});

export type SkillFormModel = z.infer<typeof skillFormSchema>;

export const skillRepositoryCreationSchema = z.object({
	ownerName: z.string(),
	name: z.string(),
	description: z.string().nullable()
});

export type SkillRepositoryCreationModel = z.infer<typeof skillRepositoryCreationSchema>;

export const skillRepositorySchema = skillRepositoryCreationSchema.extend({
	id: z.string()
});

export type SkillRepositoryModel = z.infer<typeof skillRepositorySchema>;

export const createSkillFormModelFromSkillResolved = (skill: SkillResolved): SkillFormModel => {
	return {
		name: skill.name,
		description: skill.description,
		children: skill.children.map(child => child.id),
		id: skill.id,
		repositoryId: skill.repository.id,
		parents: skill.parents.map(parent => parent.id)
	};
};
z;
export type SkillRepositoryTreeNodeModel = SkillFormModel | SkillRepositoryModel;
