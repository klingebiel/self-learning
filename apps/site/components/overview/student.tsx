import { database } from "@self-learning/database";
import {
	Dialog,
	DialogActions,
	Divider,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	SectionHeader,
	showToast
} from "@self-learning/ui/common";
import { CenteredSection, ItemCardGrid } from "@self-learning/ui/layouts";
import { ImageCard, ImageCardBadge } from "@self-learning/ui/common";
import { formatDateAgo } from "@self-learning/util/common";
import Link from "next/link";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { CogIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

type Student = Awaited<ReturnType<typeof getStudent>>;

type Props = {
	student: Student;
};

export function getStudent(username: string) {
	return database.student.findUniqueOrThrow({
		where: { username },
		select: {
			_count: {
				select: {
					completedLessons: true
				}
			},
			user: {
				select: {
					displayName: true,
					name: true,
					image: true
				}
			},
			completedLessons: {
				take: 5,
				orderBy: { createdAt: "desc" },
				select: {
					createdAt: true,
					lesson: {
						select: {
							slug: true,
							title: true
						}
					},
					course: {
						select: {
							slug: true,
							title: true,
							imgUrl: true
						}
					}
				}
			},
			enrollments: {
				orderBy: { createdAt: "desc" },
				select: {
					progress: true,
					status: true,
					course: {
						select: {
							slug: true,
							title: true,
							subtitle: true,
							imgUrl: true
						}
					}
				}
			}
		}
	});
}

export default function StudentOverview({ student }: Props) {
	const { t } = useTranslation();
	const [editStudentDialog, setEditStudentDialog] = useState(false);
	const { mutateAsync: updateStudent } = trpc.me.updateStudent.useMutation();
	const router = useRouter();

	const onEditStudentClose: Parameters<
		typeof EditStudentDialog
	>[0]["onClose"] = async updated => {
		setEditStudentDialog(false);

		if (updated) {
			try {
				await updateStudent(updated);
				showToast({
					type: "success",
					title: t("information_updated"),
					subtitle: updated.user.displayName
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
		<CenteredSection className="bg-gray-50 pb-32">
			<div className="flex flex-col gap-10">
				<section className="flex items-center">
					<ImageOrPlaceholder
						src={student.user.image ?? undefined}
						className="h-24 w-24 rounded-lg object-cover"
					/>
					<div className="flex flex-col gap-4 pl-8 pr-4">
						<h1 className="text-6xl">{student.user.displayName}</h1>
						<span>
							{t("lessons_finished_text_1")}{" "}
							<span className="mx-1 font-semibold text-secondary">
								{student._count.completedLessons}
							</span>{" "}
							{student._count.completedLessons === 1 ? t("lesson") : t("lessons")}{" "}
							{t("lessons_finished_text_2")}
						</span>
					</div>

					<button
						className="self-start rounded-full p-2 hover:bg-gray-100"
						title={t("edit")}
						onClick={() => setEditStudentDialog(true)}
					>
						<CogIcon className="h-5 text-gray-400" />
					</button>

					{editStudentDialog && (
						<EditStudentDialog
							student={{ user: { displayName: student.user.displayName } }}
							onClose={onEditStudentClose}
						/>
					)}
				</section>

				<Divider />

				<section>
					<SectionHeader title={t("recently_finished_lessons")} />
					<Activity completedLessons={student.completedLessons} />
				</section>

				<Divider />

				<section>
					<SectionHeader title={t("my_courses")} />
					<Enrollments enrollments={student.enrollments} />
				</section>
			</div>
		</CenteredSection>
	);
}

function Activity({ completedLessons }: { completedLessons: Student["completedLessons"] }) {
	return (
		<>
			{completedLessons.length > 0 ? (
				<ul className="flex flex-col gap-2">
					{completedLessons.map(lesson => (
						<li
							key={lesson.createdAt as unknown as string}
							className="flex items-center rounded-lg border border-light-border"
						>
							<ImageOrPlaceholder
								src={lesson.course?.imgUrl ?? undefined}
								className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
							/>

							<div className="flex w-full flex-wrap items-center justify-between gap-2 px-4">
								<div className="flex flex-col gap-1">
									<Link
										className="text-sm font-medium hover:text-secondary"
										href={`/courses/${lesson.course?.slug}/${lesson.lesson.slug}`}
									>
										{lesson.lesson.title}
									</Link>
									{lesson.course && (
										<span className="text-xs text-light">
											in{" "}
											<Link
												className="text-secondary hover:underline"
												href={`/courses/${lesson.course.slug}`}
											>
												{lesson.course.title}
											</Link>
										</span>
									)}
								</div>
								<span className="hidden text-sm text-light md:block">
									{formatDateAgo(lesson.createdAt)}
								</span>
							</div>
						</li>
					))}
				</ul>
			) : (
				<span className="text-sm text-light">{t("no_lesson_finished_text")}</span>
			)}
		</>
	);
}

function Enrollments({ enrollments }: { enrollments: Student["enrollments"] }) {
	return (
		<>
			{enrollments.length === 0 ? (
				<span className="text-sm text-light">{t("no_enrolled_courses")}</span>
			) : (
				<ItemCardGrid>
					{enrollments.map(enrollment => (
						<Link
							key={enrollment.course.slug}
							href={`/courses/${enrollment.course.slug}`}
						>
							<ImageCard
								slug={enrollment.course.slug}
								title={enrollment.course.title}
								subtitle={enrollment.course.subtitle}
								imgUrl={enrollment.course.imgUrl}
								badge={
									enrollment.status === "COMPLETED" ? (
										<ImageCardBadge
											className="bg-emerald-500 text-white"
											text={t("finished")}
										/>
									) : (
										<></>
									)
								}
								footer={<ProgressFooter progress={enrollment.progress} />}
							/>
						</Link>
					))}
				</ItemCardGrid>
			)}
		</>
	);
}

function ProgressFooter({ progress }: { progress: number }) {
	return (
		<span className="relative h-5 w-full rounded-lg bg-gray-200">
			<span
				className="absolute left-0 h-5 rounded-lg bg-secondary"
				style={{ width: `${progress}%` }}
			></span>
			<span
				className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
					progress === 0 ? "text-secondary" : "text-white"
				}`}
			>
				{progress}%
			</span>
		</span>
	);
}

const editStudentSchema = z.object({
	user: z.object({ displayName: z.string().min(3).max(50) })
});

type EditStudent = z.infer<typeof editStudentSchema>;

function EditStudentDialog({
	student,
	onClose
}: {
	student: EditStudent;
	onClose: OnDialogCloseFn<EditStudent>;
}) {
	const { t } = useTranslation();
	const form = useForm({
		defaultValues: student,
		resolver: zodResolver(editStudentSchema)
	});

	return (
		<Dialog title={student.user.displayName} onClose={onClose}>
			<form onSubmit={form.handleSubmit(onClose)}>
				<LabeledField
					label={t("name")}
					error={form.formState.errors.user?.displayName?.message}
				>
					<input
						{...form.register("user.displayName")}
						type="text"
						className="textfield"
					/>
				</LabeledField>

				<DialogActions onClose={onClose}>
					<button className="btn-primary" disabled={!form.formState.isValid}>
						{t("save")}
					</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
