import { database } from "@self-learning/database";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { ResolvedValue } from "@self-learning/types";
import { AuthorChip } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";

type Team = ResolvedValue<typeof getTeam>;

type TeamPageProps = {
	team: Team;
	markdownDescription: CompiledMarkdown | null;
};

export const getServerSideProps: GetServerSideProps<TeamPageProps> = async ({ params, locale }) => {
	const slug = params?.teamSlug;

	if (typeof slug !== "string") {
		throw new Error("[slug] must be a string.");
	}

	const team = await getTeam(slug);

	if (!team) {
		// Return a 404 if no matching team was found
		return { notFound: true };
	}

	let markdownDescription = null;

	if (team.description && team.description.length > 0) {
		// Compile markdown if present
		markdownDescription = await compileMarkdown(team.description);
		// Remove the original description so it's not duplicated
		team.description = null;
	}

	return {
		props: {
			// The `team` data you want to use in your page
			team: team as Team,
			// The compiled markdown string (or null)
			markdownDescription,
			// Include translations for SSR
			...(await serverSideTranslations(locale ?? "en", ["common"]))
		}
	};
};

async function getTeam(slug: string) {
	return await database.team.findUnique({
		where: { slug },
		select: {
			slug: true,
			name: true,
			imgUrl: true,
			description: true,
			authors: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			}
		}
	});
}

export default function TeamPage({ team, markdownDescription }: TeamPageProps) {
	return (
		<div className="flex flex-col bg-white">
			<CenteredSection className="gradient">
				<div className="flex flex-col gap-16">
					<div className="relative m-auto h-[256px] w-[256px] shrink-0 rounded-lg bg-white">
						{team.imgUrl && <Image className="rounded-lg" src={team.imgUrl} alt="" />}
					</div>

					<div className="flex flex-col place-items-center gap-16">
						<h1 className="text-3xl sm:text-6xl">{team.name}</h1>
						<div className="flex flex-wrap gap-4">
							{team.authors.map(author => (
								<AuthorChip
									key={author.slug}
									slug={author.slug}
									displayName={author.displayName}
									imgUrl={author.imgUrl}
								/>
							))}
						</div>
					</div>
				</div>
			</CenteredSection>

			{markdownDescription && (
				<CenteredSection className="bg-white">
					<div className="prose mx-auto max-w-max">
						<MDXRemote {...markdownDescription} />
					</div>
				</CenteredSection>
			)}
		</div>
	);
}
