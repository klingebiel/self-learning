import {
	Dialog,
	DialogActions,
	LoadingBox,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AuthorGuard, useRequiredSession } from "@self-learning/ui/layouts";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@self-learning/api-client";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export function SkillRepositoryOverview() {
	useRequiredSession();

	const [displayName, setDisplayName] = useState("");
	const { t } = useTranslation();

	const { data: skillTrees, isLoading } = trpc.skill.getRepositoriesByUser.useQuery();

	const filteredSkillTrees = useMemo(() => {
		if (!skillTrees) return [];
		if (!displayName || displayName.length === 0) return skillTrees;
		const lowerCaseDisplayName = displayName.toLowerCase().trim();
		return skillTrees.filter(skillTree =>
			skillTree.name.toLowerCase().includes(lowerCaseDisplayName)
		);
	}, [displayName, skillTrees]);

	return (
		<AuthorGuard>
			<div className="flex min-h-[300px] flex-col">
				<SearchField
					placeholder={t("skill_tree_search")}
					onChange={e => {
						setDisplayName(e.target.value);
					}}
				/>

				{isLoading ? (
					<LoadingBox />
				) : (
					<Table
						head={
							<>
								<TableHeaderColumn>{t("name")}</TableHeaderColumn>
								<TableHeaderColumn></TableHeaderColumn>
							</>
						}
					>
						{filteredSkillTrees.map(({ name, id }) => (
							<Fragment key={name}>
								{name && (
									<tr key={name}>
										<TableDataColumn>
											<div className="flex flex-wrap gap-4">
												<Link
													className="text-sm font-medium hover:text-secondary"
													href={`/skills/repository/${id}`}
												>
													{name}
												</Link>
											</div>
										</TableDataColumn>
										<TableDataColumn>
											<RepositoryTaskbar repositoryId={id} />
										</TableDataColumn>
									</tr>
								)}
							</Fragment>
						))}
						{filteredSkillTrees.length === 0 && (
							<Fragment key={"no_data_there:default"}>
								<tr key={"default:table"}>
									<TableDataColumn>
										<div className="flex flex-wrap gap-4">
											<span className="text-sm font-medium hover:text-secondary">
												{t("no_skill_repository")}
											</span>
										</div>
									</TableDataColumn>
									<TableDataColumn>
										<div className="flex flex-wrap justify-end gap-4" />
									</TableDataColumn>
								</tr>
							</Fragment>
						)}
					</Table>
				)}
			</div>
		</AuthorGuard>
	);
}

function RepositoryTaskbar({ repositoryId }: { repositoryId: string }) {
	const { t } = useTranslation();
	return (
		<div className="flex flex-wrap justify-end gap-4">
			<Link href={`/skills/repository/${repositoryId}`}>
				<button type="button" className="btn-stroked w-fit self-end">
					<PencilIcon className="icon" />
					<span>{t("edit")}</span>
				</button>
			</Link>
			<RepositoryDeleteOption repositoryId={repositoryId} />
		</div>
	);
}

function RepositoryDeleteOption({ repositoryId }: { repositoryId: string }) {
	const { mutateAsync: deleteRepo } = trpc.skill.deleteRepository.useMutation();
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleDelete = async () => {
		await deleteRepo({ id: repositoryId });
	};

	const handleConfirm = () => {
		handleDelete();
		setShowConfirmation(false);
	};

	const handleCancel = () => {
		setShowConfirmation(false);
	};
	const { t } = useTranslation();

	return (
		<>
			<button
				className="rounded bg-red-500 font-medium text-white hover:bg-red-600"
				onClick={() => setShowConfirmation(true)}
			>
				<div className="ml-4">
					<TrashIcon className="icon " />
				</div>
			</button>
			{showConfirmation && (
				<Dialog title={t("delete")} onClose={handleCancel}>
					{t("delete_repo_message")}
					<DialogActions onClose={handleCancel}>
						<button className="btn-primary hover:bg-red-500" onClick={handleConfirm}>
							{t("delete")}
						</button>
					</DialogActions>
				</Dialog>
			)}
		</>
	);
}
