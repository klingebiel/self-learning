import { SparklesIcon } from "@heroicons/react/24/solid";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { ImageCard } from "@self-learning/ui/common";
import { ItemCardGrid } from "@self-learning/ui/layouts";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

async function getSubjects() {
	return await database.subject.findMany({
		select: {
			slug: true,
			title: true,
			subtitle: true,
			cardImgUrl: true,
			_count: {
				select: {
					specializations: true
				}
			}
		}
	});
}

type SubjectsProps = {
	subjects: ResolvedValue<typeof getSubjects>;
};

export const getServerSideProps: GetServerSideProps<SubjectsProps> = async context => {
	const subjects = await getSubjects();
	const { locale } = context;

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			subjects
		}
	};
};

export default function Subjects({ subjects }: SubjectsProps) {
	return (
		<div className="bg-gray-50 py-16">
			<div className="mx-auto max-w-screen-xl px-4 xl:px-0">
				<h1 className="mb-16 text-4xl sm:text-6xl">Fachgebiete</h1>
				<ItemCardGrid>
					{subjects.map(subject => (
						<SubjectCard key={subject.slug} subject={subject} />
					))}
				</ItemCardGrid>
			</div>
		</div>
	);
}

function SubjectCard({ subject }: { subject: SubjectsProps["subjects"][0] }) {
	return (
		<Link href={`/subjects/${subject.slug}`}>
			<ImageCard
				slug={subject.slug}
				title={subject.title}
				subtitle={subject.subtitle}
				imgUrl={subject.cardImgUrl}
				footer={
					<span className="flex items-center gap-3 text-sm font-semibold text-purple-500">
						<SparklesIcon className="h-5" />
						<span>
							{subject._count.specializations}{" "}
							{subject._count.specializations === 1
								? "Spezialisierung"
								: "Spezialisierungen"}
						</span>
					</span>
				}
			/>
		</Link>
	);
}
