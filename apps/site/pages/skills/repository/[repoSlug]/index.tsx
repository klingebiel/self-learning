import { GetServerSideProps } from "next";
import { database } from "@self-learning/database";
import { getAuthenticatedUser } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { getSkills } from "libs/data-access/api/src/lib/trpc/routers/skill.router"; // TODO change
import { LoadingBox } from "@self-learning/ui/common";
import { SkillFormModel } from "@self-learning/types";
import { SkillRepository } from "@prisma/client";
import { SkillFolderEditor } from "@self-learning/teaching";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface CreateAndViewRepositoryProps {
	repository: SkillRepository;
	initialSkills: SkillFormModel[];
}

async function createNewRepository(userName: string) {
	const newRep = {
		ownerName: userName,
		name: `Neue Skillkarte: ${Date.now()}`,
		description: "Beschreibung der Skillkarte"
	};
	const result = await database.skillRepository.create({
		data: newRep
	});

	const newRepoSlug = result.id;
	return {
		redirect: {
			destination: `/skills/repository/${newRepoSlug}`,
			permanent: false
		}
	};
}

export const getServerSideProps: GetServerSideProps<CreateAndViewRepositoryProps> = async ctx => {
	const repoId = ctx.query.repoSlug as string;
	const user = await getAuthenticatedUser(ctx);
	const { locale } = ctx;

	if (!user) {
		return {
			redirect: {
				destination: `/403`, // your new URL here
				permanent: false
			}
		};
	}

	if (!repoId || repoId === "") return { notFound: true };

	if (repoId === "create") {
		return await createNewRepository(user.name ?? "user-id");
	}

	const repo = await database.skillRepository.findUnique({ where: { id: repoId } });
	if (!repo) return { notFound: true };

	const transformedSkill = await getSkills(repoId);

	return {
		props: {
			repository: repo,
			initialSkills: transformedSkill
		},
		...(await serverSideTranslations(locale ?? "en", ["common"])),
		notFound: false
	};
};

export default function CreateAndViewRepository({
	repository,
	initialSkills
}: CreateAndViewRepositoryProps) {
	const { data: skills = initialSkills, isLoading } = trpc.skill.getSkillsFromRepository.useQuery(
		{ repoId: repository.id },
		{ initialData: initialSkills }
	);

	const skillContent = new Map<string, SkillFormModel>();
	skills.forEach(skill => {
		skillContent.set(skill.id, skill);
	});

	if (isLoading) {
		return <LoadingBox />;
	}

	return <SkillFolderEditor skills={skillContent} repository={repository} />;
}
