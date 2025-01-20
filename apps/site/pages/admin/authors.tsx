import { PlusIcon } from "@heroicons/react/24/solid";
import { SearchUserDialog, EditAuthorDialog } from "@self-learning/admin";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	LoadingBox,
	showToast,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function AuthorsPage() {
	useRequiredSession();

	const [displayName, setDisplayName] = useState("");
	const { data: users, isLoading } = trpc.author.getAllWithSubject.useQuery();
	const [editTarget, setEditTarget] = useState<string | null>(null);
	const [createAuthorDialog, setCreateAuthorDialog] = useState(false);
	const { mutateAsync: promoteToAuthor } = trpc.admin.promoteToAuthor.useMutation();
	const filteredAuthors = useMemo(() => {
		if (!users) return [];
		if (!displayName || displayName.length === 0) return users;

		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return users.filter(user =>
			user.author?.displayName.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, users]);

	function onEdit(username: string): void {
		setEditTarget(username);
	}

	function onEditDialogClose(): void {
		setEditTarget(null);
	}

	async function onCreateAuthor(username?: string): Promise<void> {
		setCreateAuthorDialog(false);

		if (username) {
			try {
				await promoteToAuthor({ username });
				showToast({ type: "success", title: "Autor hinzugefügt", subtitle: username });
			} catch (error) {
				if (error instanceof TRPCClientError) {
					showToast({
						type: "error",
						title: "Fehler",
						subtitle: "Autor konnte nicht hinzugefügt werden."
					});
				}
			}
		}
	}

	return (
		<AdminGuard>
			<CenteredSection>
				<div className="mb-16 flex items-center justify-between gap-4">
					<h1 className="text-5xl">Autoren</h1>
					<button className="btn-primary" onClick={() => setCreateAuthorDialog(true)}>
						<PlusIcon className="icon h-5" />
						<span>Autor hinzufügen</span>
					</button>
					{createAuthorDialog && (
						<SearchUserDialog open={createAuthorDialog} onClose={onCreateAuthor} />
					)}
				</div>

				<SearchField
					placeholder="Suche nach Autor"
					onChange={e => setDisplayName(e.target.value)}
				/>

				{editTarget && (
					<EditAuthorDialog onClose={onEditDialogClose} username={editTarget} />
				)}

				{isLoading ? (
					<LoadingBox />
				) : (
					<Table
						head={
							<>
								<TableHeaderColumn></TableHeaderColumn>
								<TableHeaderColumn>Name</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{filteredAuthors.map(({ author, name }) => (
							<Fragment key={name}>
								{author && (
									<tr key={name}>
										<TableDataColumn>
											<ImageOrPlaceholder
												src={author?.imgUrl ?? undefined}
												className="m-0 h-10 w-10 rounded-lg object-cover"
											/>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
												<Link
													className="text-sm font-medium hover:text-secondary"
													href={`/authors/${author.slug}`}
												>
													{author.displayName}
												</Link>
												<span className="flex gap-2 text-xs">
													{author.subjectAdmin.map(({ subject }) => (
														<span
															key={subject.title}
															className="rounded-full bg-secondary px-3 py-[2px] text-white"
														>
															Admin: {subject.title}
														</span>
													))}
												</span>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<div className="flex flex-wrap justify-end gap-4">
												<button
													className="btn-stroked"
													onClick={() => onEdit(name)}
												>
													Editieren
												</button>
											</div>
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
					</Table>
				)}
			</CenteredSection>
		</AdminGuard>
	);
}

export async function getServerSideProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"]))
		}
	};
}
