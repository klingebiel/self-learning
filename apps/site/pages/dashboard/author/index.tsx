import { PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { TeacherView } from "@self-learning/analysis";
import { withAuth } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import { SkillRepositoryOverview } from "@self-learning/teaching";
import {
	Divider,
	IconButton,
	ImageChip,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { VoidSvg } from "@self-learning/ui/static";
import { formatDateAgo } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = {
	author: Author;
};

export function getAuthor(username: string) {
	return database.author.findUniqueOrThrow({
		where: { username },
		select: {
			slug: true,
			displayName: true,
			imgUrl: true,
			subjectAdmin: {
				orderBy: { subject: { title: "asc" } },
				select: {
					subject: {
						select: {
							subjectId: true,
							title: true,
							cardImgUrl: true
						}
					}
				}
			},
			specializationAdmin: {
				orderBy: { specialization: { title: "asc" } },
				select: {
					specialization: {
						select: {
							specializationId: true,
							title: true,
							cardImgUrl: true,
							subject: {
								select: {
									subjectId: true,
									title: true
								}
							}
						}
					}
				}
			},
			courses: {
				orderBy: { title: "asc" },
				select: {
					courseId: true,
					slug: true,
					title: true,
					imgUrl: true,
					specializations: {
						select: {
							title: true
						}
					}
				}
			}
		}
	});
}

export const getServerSideProps: GetServerSideProps<Props> = withAuth<Props>(
	async (context, user) => {
		const { locale } = context;

		if (user.isAuthor) {
			return {
				props: {
					...(await serverSideTranslations(locale ?? "en", ["common"])),
					author: await getAuthor(user.name)
				}
			};
		}

		return {
			redirect: {
				destination: "/",
				permanent: false
			}
		};
	}
);

export default function Start(props: Props) {
	return <AuthorDashboardPage {...props} />;
}

function AuthorDashboardPage({ author }: Props) {
	const session = useRequiredSession();
	const authorName = session.data?.user.name;

	return (
		<div className="bg-gray-50">
			<CenteredSection>
				<div className="flex flex-col gap-10">
					{author.subjectAdmin.length > 0 && (
						<>
							<section>
								<SectionHeader
									title="Fachgebiete"
									subtitle="Administrator in den folgenden Fachgebieten:"
								/>

								<ul className="flex flex-wrap gap-4">
									{author.subjectAdmin.map(({ subject }) => (
										<ImageChip
											key={subject.subjectId}
											imgUrl={subject.cardImgUrl}
										>
											<Link
												href={`/teaching/subjects/${subject.subjectId}`}
												className="font-medium hover:text-secondary"
											>
												{subject.title}
											</Link>
										</ImageChip>
									))}
								</ul>
							</section>
						</>
					)}

					{author.specializationAdmin.length > 0 && (
						<>
							<Divider />
							<section>
								<SectionHeader
									title="Spezialisierungen"
									subtitle="Administrator in den folgenden Spezialisierungen:"
								/>

								<ul className="flex flex-wrap gap-4">
									{author.specializationAdmin.map(({ specialization }) => (
										<ImageChip
											key={specialization.specializationId}
											imgUrl={specialization.cardImgUrl}
										>
											<Link
												href={`/teaching/subjects/${specialization.subject.subjectId}/${specialization.specializationId}`}
												className="font-medium hover:text-secondary"
											>
												{specialization.title}
											</Link>
										</ImageChip>
									))}
								</ul>
							</section>
						</>
					)}

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Kurse"
								subtitle="Autor in den folgenden Kursen:"
							/>

							<Link href="/teaching/courses/create">
								<IconButton
									text="Neuen Kurs erstellen"
									icon={<PlusIcon className="icon h-5" />}
								/>
							</Link>
						</div>

						<ul className="flex flex-col gap-4 py-4">
							{author.courses.length === 0 ? (
								<div className="mx-auto flex items-center gap-8">
									<div className="h-32 w-32">
										<VoidSvg />
									</div>
									<p className="text-light">Du hast noch keine Kurse erstellt.</p>
								</div>
							) : (
								author.courses.map(course => (
									<li
										key={course.courseId}
										className="flex items-center rounded-lg border border-light-border bg-white"
									>
										<ImageOrPlaceholder
											src={course.imgUrl ?? undefined}
											className="h-16 w-16 rounded-l-lg object-cover"
										/>

										<div className="flex w-full items-center justify-between px-4">
											<div className="flex flex-col gap-1">
												<span className="text-xs text-light">
													{course.specializations
														.map(s => s.title)
														.join(" | ")}
												</span>
												<Link
													href={`/courses/${course.slug}`}
													className="text-sm font-medium hover:text-secondary"
												>
													{course.title}
												</Link>
											</div>

											<Link
												href={`/teaching/courses/edit/${course.courseId}`}
												className="btn-stroked h-fit w-fit"
											>
												<PencilIcon className="icon" />
												<span>Bearbeiten</span>
											</Link>
										</div>
									</li>
								))
							)}
						</ul>
					</section>

					<Divider />

					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Meine Lerneinheiten"
								subtitle="Autor der folgenden Lerneinheiten:"
							/>

							<Link href="/teaching/lessons/create">
								<IconButton
									text="Neue Lerneinheit erstellen"
									icon={<PlusIcon className="icon h-5" />}
								/>
							</Link>
						</div>

						{authorName && <Lessons authorName={authorName} />}
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Skillkarten"
								subtitle="Besitzer der folgenden Repositories"
							/>
							<Link href="/skills/repository/create">
								<IconButton
									icon={<PlusIcon className="icon h-5" />}
									text="Skillkarten anlegen"
								/>
							</Link>
						</div>
						<SkillRepositoryOverview />
					</section>

					<Divider />
					<section>
						<div className="flex justify-between gap-4">
							<SectionHeader
								title="Teilnahmeübersicht"
								subtitle="Es werden aus datenschutzgründen nur Angaben bei mindestens 10
				teilnehmenden Studierenden angezeigt."
							/>
						</div>
						<TeacherView />
					</section>
				</div>
			</CenteredSection>
		</div>
	);
}

function Lessons({ authorName }: { authorName: string }) {
	const router = useRouter();
	const { title = "", page = 1 } = router.query;

	const { data: lessons } = trpc.lesson.findMany.useQuery(
		{
			page: Number(page),
			title: title as string,
			authorName
		},
		{
			keepPreviousData: true,
			staleTime: 10_000
		}
	);

	return (
		<div className="flex min-h-[200px] flex-col">
			{!lessons ? (
				<LoadingBox />
			) : (
				<>
					<SearchField
						placeholder="Suche nach Lerneinheit"
						value={title}
						onChange={e => {
							router.push(
								{
									query: {
										title: e.target.value,
										page: 1
									}
								},
								undefined,
								{ shallow: true }
							);
						}}
					/>

					<Table
						head={
							<>
								<TableHeaderColumn>Titel</TableHeaderColumn>
								<TableHeaderColumn>Letzte Änderung</TableHeaderColumn>
							</>
						}
					>
						{lessons.result.map(lesson => (
							<tr key={lesson.lessonId}>
								<TableDataColumn>
									<Link
										href={`/teaching/lessons/edit/${lesson.lessonId}`}
										className="font-medium hover:text-secondary"
									>
										{lesson.title}
									</Link>
								</TableDataColumn>
								<TableDataColumn>
									<span className="text-light">
										{formatDateAgo(lesson.updatedAt)}
									</span>
								</TableDataColumn>
							</tr>
						))}
					</Table>

					<Paginator pagination={lessons} url={`${router.route}?title=${title}`} />
				</>
			)}
		</div>
	);
}
