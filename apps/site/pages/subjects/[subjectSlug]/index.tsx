import { Square3Stack3DIcon } from "@heroicons/react/24/solid";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { ItemCardGrid, TopicHeader } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type SubjectPageProps = {
	subject: ResolvedValue<typeof getSubject>;
};

export const getServerSideProps: GetServerSideProps<SubjectPageProps> = async ({
	params,
	locale
}) => {
	const subjectSlug = params?.subjectSlug;

	if (typeof subjectSlug !== "string") {
		throw new Error("[subjectSlug] must be a string.");
	}

	const subject = await getSubject(subjectSlug);

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			subject: subject as ResolvedValue<typeof getSubject>
		},
		notFound: !subject
	};
};

async function getSubject(subjectSlug: string) {
	return await database.subject.findUnique({
		where: { slug: subjectSlug },
		include: {
			specializations: {
				select: {
					slug: true,
					title: true,
					subtitle: true,
					cardImgUrl: true,
					_count: {
						select: {
							courses: true
						}
					}
				}
			}
		}
	});
}

export default function SubjectPage({ subject }: SubjectPageProps) {
	const { title, subtitle, specializations, imgUrlBanner } = subject;

	return (
		<div className="bg-gray-50 pb-32">
			<TopicHeader
				imgUrlBanner={imgUrlBanner}
				parentLink="/subjects"
				parentTitle="Fachgebiet"
				title={title}
				subtitle={subtitle}
			/>
			<div className="mx-auto flex max-w-screen-xl flex-col px-4 pt-8 xl:px-0">
				{specializations.length > 0 ? (
					<ItemCardGrid>
						{specializations.map(specialization => (
							<SpecializationCard
								key={specialization.slug}
								subjectSlug={subject.slug}
								specialization={specialization}
							/>
						))}
					</ItemCardGrid>
				) : (
					<div className="grid gap-16 pt-16">
						<span className="mx-auto font-semibold">
							Leider gibt es hier noch keine Inhalte.
						</span>
						<div className="mx-auto w-full max-w-md ">
							<VoidSvg />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function SpecializationCard({
	subjectSlug,
	specialization
}: {
	subjectSlug: string;
	specialization: SubjectPageProps["subject"]["specializations"][0];
}) {
	return (
		<Link href={`/subjects/${subjectSlug}/${specialization.slug}`}>
			<ImageCard
				slug={specialization.slug}
				title={specialization.title}
				subtitle={specialization.subtitle}
				imgUrl={specialization.cardImgUrl}
				badge={<ImageCardBadge text="Spezialisierung" className="bg-purple-500" />}
				footer={
					<span className="flex items-center gap-3 text-sm font-semibold text-emerald-500">
						<Square3Stack3DIcon className="h-5" />
						<span>
							{specialization._count.courses}{" "}
							{specialization._count.courses === 1 ? "Kurs" : "Kurse"}
						</span>
					</span>
				}
			/>
		</Link>
	);
}
