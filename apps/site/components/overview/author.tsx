import { CogIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { database } from "@self-learning/database";
import {
	Divider,
	ImageChip,
	ImageOrPlaceholder,
	LoadingBox,
	Paginator,
	SectionHeader,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { formatDateAgo } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, useState } from "react";
import { ReactComponent as VoidSvg } from "../../svg/void.svg";
import { SkillRepositoryOverview } from "@self-learning/teaching";
import { useTranslation } from "react-i18next";

const EditAuthorDialog = dynamic(
	() => import("@self-learning/teaching").then(m => m.EditAuthorDialog),
	{ ssr: false }
);

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

type Author = Awaited<ReturnType<typeof getAuthor>>;

type Props = {
	author: Author;
};

export default function AuthorOverview({ author }: Props) {
	const session = useRequiredSession();
	const authorName = session.data?.user.name;
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const { mutateAsync: updateAuthor } = trpc.author.updateSelf.useMutation();
	const router = useRouter();
	const { t } = useTranslation();

	const onEditDialogClose: ComponentProps<
		typeof EditAuthorDialog
	>["onClose"] = async editedAuthor => {
		setOpenEditDialog(false);

		if (editedAuthor) {
			try {
				await updateAuthor(editedAuthor);
				showToast({
					type: "success",
					title: t("infos_updated"),
					subtitle: t("re-login_ask")
				});
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);

				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: t("error"), subtitle: error.message });
				}
			}
		}
	};

	return (
		<CenteredSection className="bg-gray-50">
			<div className="flex flex-col gap-10">
				<section className="flex">
					<ImageOrPlaceholder
						src={author.imgUrl ?? undefined}
						className="h-24 w-24 rounded-lg object-cover"
					/>
					<div className="flex flex-col pl-8 pr-4">
						<h1 className="text-6xl">{author.displayName}</h1>
						<div className="flex items-center gap-4">
							<Link
								href={`/authors/${author.slug}`}
								className="font-medium text-secondary hover:underline"
							>
								/{author.slug}
							</Link>
							<button
								className="h-fit w-fit rounded-full p-2 hover:bg-gray-200"
								title={t("edit")}
								onClick={() => setOpenEditDialog(true)}
							>
								<CogIcon className="h-5 justify-self-start text-gray-400" />
							</button>

							{openEditDialog && (
								<EditAuthorDialog author={author} onClose={onEditDialogClose} />
							)}
						</div>
					</div>
				</section>

				{author.subjectAdmin.length > 0 && (
					<>
						<Divider />

						<section>
							<SectionHeader
								title={t("subjects")}
								subtitle={t("admin_in_subjects")}
							/>

							<ul className="flex flex-wrap gap-4">
								{author.subjectAdmin.map(({ subject }) => (
									<ImageChip key={subject.subjectId} imgUrl={subject.cardImgUrl}>
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
								title={t("specializations")}
								subtitle={t("admin_in_specializations")}
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
						<SectionHeader title={t("my_courses")} subtitle={t("author_in_courses")} />

						<Link href="/teaching/courses/create" className="btn-primary h-fit w-fit">
							<PlusIcon className="icon" />
							<span>{t("create_course")}</span>
						</Link>
					</div>

					<ul className="flex flex-col gap-4 py-4">
						{author.courses.length === 0 ? (
							<div className="mx-auto flex items-center gap-8">
								<div className="h-32 w-32">
									<VoidSvg />
								</div>
								<p className="text-light">{t("no_course_created")}</p>
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
											<span>{t("edit")}</span>
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
							title={t("my_learning_units")}
							subtitle={t("author_in_units")}
						/>

						<Link href="/teaching/lessons/create" className="btn-primary h-fit w-fit">
							<PlusIcon className="icon" />
							<span>{t("create_unit")}</span>
						</Link>
					</div>

					{authorName && <Lessons authorName={authorName} />}
				</section>

				<Divider />
				<section>
					<div className="flex justify-between gap-4">
						<SectionHeader title={t("skillcard")} subtitle={t("repo_owner")} />
						<Link href="skills/repository/create" className="btn-primary h-fit w-fit">
							<PlusIcon className="icon h-5" />
							<span>{t("creating_skillcard")}</span>
						</Link>
					</div>
					<SkillRepositoryOverview />
				</section>
			</div>
		</CenteredSection>
	);
}

function Lessons({ authorName }: { authorName: string }) {
	const router = useRouter();
	const { t } = useTranslation();
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
						placeholder={t("search_for_unit")}
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
								<TableHeaderColumn>{t("title")}</TableHeaderColumn>
								<TableHeaderColumn>{t("last_change")}</TableHeaderColumn>
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
