import { PlusIcon } from "@heroicons/react/24/solid";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { TRPCClientError } from "@trpc/client";
import { inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import { AddAuthorDialog, AuthorFromGetAllQuery } from "../author/add-author-dialog";
import { useTranslation } from "react-i18next";

type AuthorSpecializationMap = {
	[specializationId: string]: {
		[username: string]: boolean;
	};
};

type SpecializationsFromQuery =
	inferRouterOutputs<AppRouter>["subject"]["getForEdit"]["specializations"];

export function SpecializationPermissionsDialog({
	subjectId,
	onClose,
	specializations
}: {
	subjectId: string;
	specializations: SpecializationsFromQuery;
	onClose: () => void;
}) {
	const [authors, setAuthors] = useState(() => {
		const initialAuthors = specializations
			.flatMap(a => a.specializationAdmin)
			.map(a => a.author);

		const map = new Map<
			string,
			SpecializationsFromQuery[0]["specializationAdmin"][0]["author"]
		>();

		for (const author of initialAuthors) {
			map.set(author.username, author);
		}

		return Array.from(map.values());
	});

	const [specMap, setSpecMap] = useState<AuthorSpecializationMap>(() => {
		const _specMapp: AuthorSpecializationMap = {};

		for (const spec of specializations) {
			const usernames: Record<string, boolean> = {};
			for (const admin of spec.specializationAdmin) {
				usernames[admin.author.username] = true;
			}
			_specMapp[spec.specializationId] = usernames;
		}

		return _specMapp;
	});

	const [openAddAuthorDialog, setOpenAddAuthorDialog] = useState(false);
	const { t } = useTranslation();

	const { mutateAsync: updateSpecAdmins } =
		trpc.subject.setSpecializationPermissions.useMutation();
	const onAddAuthorDialogClosed: OnDialogCloseFn<AuthorFromGetAllQuery> = author => {
		setOpenAddAuthorDialog(false);
		if (!author) return;

		if (authors.some(a => a.username === author.username)) {
			showToast({
				type: "warning",
				title: t("already_exists"),
				subtitle: author.displayName
			});
			return;
		}

		setAuthors(prev => {
			return [author, ...prev];
		});
	};

	function onChecked(specId: string, username: string, checked: boolean) {
		setSpecMap(prev => ({
			...prev,
			[specId]: {
				...prev[specId],
				[username]: checked
			}
		}));
	}

	async function onSave() {
		try {
			await updateSpecAdmins({ subjectId, specMap });
			showToast({ type: "success", title: t("updated_specs_admin"), subtitle: "" });
			onClose();
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: t("error"), subtitle: error.message });
			}
		}
	}

	return (
		<Dialog
			onClose={onClose}
			title={t("authors_with_permissions")}
			style={{ maxWidth: "80vw", maxHeight: "80vh" }}
		>
			<div className="flex flex-col gap-4 divide-x divide-light-border overflow-auto">
				<div className="text-sm text-light">
					<p>
						{t("author_permission_text_1")}
						<strong>{t("specialization")}</strong> {t("author_permission_text_2")}
					</p>
					<p>{t("author_permission_text_3")}</p>
					<p>
						{t("author_permission_text_4")} <strong>{t("add_author")}</strong>
						{t("author_permission_text_5")}
					</p>
				</div>

				<button
					type="button"
					className="btn-primary w-fit"
					onClick={() => setOpenAddAuthorDialog(true)}
				>
					<PlusIcon className="icon h-5" />
					<span>{t("add_author")}</span>
				</button>

				{openAddAuthorDialog && (
					<AddAuthorDialog open={openAddAuthorDialog} onClose={onAddAuthorDialogClosed} />
				)}

				<Table
					head={
						<>
							<TableHeaderColumn>{t("author")}</TableHeaderColumn>
							{specializations.map(spec => (
								<TableHeaderColumn key={spec.specializationId}>
									{spec.title}
								</TableHeaderColumn>
							))}
						</>
					}
				>
					{authors.map(author => (
						<tr key={author.username}>
							<TableDataColumn>
								<span className="flex items-center gap-4">
									<ImageOrPlaceholder
										src={author.imgUrl ?? undefined}
										className="h-10 w-10 shrink-0 rounded-lg object-cover"
									/>
									<a
										target="_blank"
										rel="noreferrer"
										href={`/authors/${author.slug}`}
										className="whitespace-nowrap hover:text-secondary"
									>
										{author.displayName}
									</a>
								</span>
							</TableDataColumn>
							{specializations.map(spec => (
								<TableDataColumn key={spec.specializationId}>
									<span className="flex justify-center">
										<input
											type={"checkbox"}
											className="checkbox"
											checked={
												specMap[spec.specializationId][author.username] ===
												true
											}
											onChange={e => {
												onChecked(
													spec.specializationId,
													author.username,
													e.target.checked
												);
											}}
										/>
									</span>
								</TableDataColumn>
							))}
						</tr>
					))}
				</Table>
			</div>

			<DialogActions onClose={onClose}>
				<button type="button" className="btn-primary" onClick={onSave}>
					{t("save")}
				</button>
			</DialogActions>
		</Dialog>
	);
}
