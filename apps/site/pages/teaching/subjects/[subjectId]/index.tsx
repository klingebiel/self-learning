import { PencilIcon, PlusIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { SpecializationPermissionsDialog } from "@self-learning/teaching";
import { AuthorChip, ImageOrPlaceholder, SectionHeader } from "@self-learning/ui/common";
import { CenteredContainerXL, TopicHeader, Unauthorized } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function SubjectManagementPage() {
	const router = useRouter();
	const { t } = useTranslation();

	const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
	const { data: permissions } = trpc.me.permissions.useQuery();
	const { data: subject } = trpc.subject.getForEdit.useQuery(
		{
			subjectId: router.query.subjectId as string
		},
		{
			enabled: !!router.query.subjectId
		}
	);

	const canView =
		!!subject &&
		!!permissions &&
		(permissions.role === "ADMIN" ||
			permissions.author?.subjectAdmin.find(s => s.subjectId === subject.subjectId));

	if (!canView) {
		return (
			<Unauthorized>
				<ul className="list-inside list-disc">
					<li>{t("admins")}</li>
					<li>
						{t("admins_for_subject")} ({router.query.subjectId})
					</li>
				</ul>
			</Unauthorized>
		);
	}

	return (
		<div className="flex flex-col gap-8 bg-gray-50 pb-32">
			<TopicHeader
				imgUrlBanner={subject?.imgUrlBanner}
				parentLink="/subjects"
				parentTitle={t("subject")}
				title={subject.title}
				subtitle={subject.subtitle}
			>
				<Link
					href={`/teaching/subjects/${subject.subjectId}/edit`}
					className="btn-primary absolute top-8 w-fit self-end"
				>
					<PencilIcon className="icon h-5" />
					<span>{t("edit")}</span>
				</Link>
			</TopicHeader>

			<CenteredContainerXL>
				<SectionHeader
					title={t("specializations")}
					subtitle={t("specialization_for_subject")}
				/>

				<div className="mb-8 flex flex-wrap gap-4">
					<Link
						className="btn-primary w-fit"
						href={`/teaching/subjects/${subject.subjectId}/create`}
					>
						<PlusIcon className="icon h-5" />
						<span>{t("add")}</span>
					</Link>

					<button
						className="btn-stroked h-fit"
						type="button"
						onClick={() => setOpenPermissionDialog(true)}
					>
						<UserGroupIcon className="icon h-5" />
						<span>{t("manage_authors")}</span>
					</button>

					{openPermissionDialog && (
						<SpecializationPermissionsDialog
							subjectId={subject.subjectId}
							specializations={subject.specializations}
							onClose={() => setOpenPermissionDialog(false)}
						/>
					)}
				</div>

				<ul className="flex flex-col gap-4">
					{subject.specializations.map(spec => (
						<li
							key={spec.specializationId}
							className="flex rounded-lg border border-light-border bg-white"
						>
							<ImageOrPlaceholder
								src={spec.cardImgUrl ?? undefined}
								className="w-32 rounded-l-lg object-cover"
							/>
							<div className="flex w-full flex-col justify-between gap-4 p-4">
								<div className="flex flex-col gap-2">
									<Link
										href={`/teaching/subjects/${subject.subjectId}/${spec.specializationId}`}
										className="text-lg font-semibold hover:text-secondary"
									>
										{spec.title}
									</Link>
									<p className="text-sm text-light">{spec.subtitle}</p>
								</div>

								<ul className="flex flex-wrap gap-4">
									{spec.specializationAdmin.map(admin => (
										<AuthorChip
											imgUrl={admin.author.imgUrl}
											displayName={admin.author.displayName}
											key={admin.author.username}
											slug={admin.author.slug}
										/>
									))}
								</ul>
							</div>
						</li>
					))}
				</ul>
			</CenteredContainerXL>
		</div>
	);

	return;
}
