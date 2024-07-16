import { Combobox } from "@headlessui/react";
import { AppRouter } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, ImageOrPlaceholder } from "@self-learning/ui/common";
import { inferRouterOutputs } from "@trpc/server";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export type AuthorFromGetAllQuery = inferRouterOutputs<AppRouter>["author"]["getAll"][0];

/**
 * Dialog that allows the user to select an author from a list of authors.
 */
export function AddAuthorDialog({
	onClose,
	open
}: {
	open: boolean;
	onClose: (author?: AuthorFromGetAllQuery) => void;
}) {
	const { t } = useTranslation();
	const { data: _authors } = trpc.author.getAll.useQuery();
	const [filter, setFilter] = useState("");

	const filteredAuthors = useMemo(() => {
		if (!_authors) return [];

		if (!filter || filter === "") {
			return _authors;
		}

		const lcFilter = filter.toLowerCase();
		return _authors.filter(author => author.displayName.toLowerCase().includes(lcFilter));
	}, [_authors, filter]);

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null} onChange={onClose}>
				<DropdownDialog.SearchInput
					filter={filter}
					setFilter={setFilter}
					placeholder={t("search_for_author")}
				/>

				<DropdownDialog.Options>
					{filteredAuthors.map(author => (
						<Combobox.Option value={author} key={author.slug} as={Fragment}>
							{({ active }) => (
								<button
									type="button"
									data-testid="author-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										active ? "bg-secondary text-white" : ""
									}`}
								>
									<ImageOrPlaceholder
										src={author.imgUrl ?? undefined}
										className="h-10 w-10 rounded-lg object-cover"
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium">
											{author.displayName}
										</span>
										<span
											className={`text-start text-xs ${
												active ? "text-white" : "text-light"
											}`}
										>
											{author.username}
										</span>
									</div>
								</button>
							)}
						</Combobox.Option>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}
