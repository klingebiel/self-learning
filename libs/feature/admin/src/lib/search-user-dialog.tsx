import { Combobox } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import {
	DropdownDialog,
	ImageOrPlaceholder,
	OnDialogCloseFn,
	Paginator
} from "@self-learning/ui/common";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

export function SearchUserDialog({
	onClose,
	open
}: {
	open: boolean;
	/** Returns the `username` of the selected user, or `undefined`, if no user was selected. */
	onClose: OnDialogCloseFn<string>;
}) {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [page, setPage] = useState(1);
	const { data: users } = trpc.admin.findUsers.useQuery(
		{
			page,
			name
		},
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null} onChange={onClose}>
				<DropdownDialog.SearchInput
					filter={name}
					setFilter={setName}
					placeholder={t("search_for_user")}
				/>

				<DropdownDialog.PaginationContainer>
					{users && <Paginator pagination={users} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{users?.result.map(user => (
						<Combobox.Option value={user.name} key={user.name} as={Fragment}>
							{({ active }) => (
								<button
									type="button"
									data-testid="author-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										active ? "bg-secondary text-white" : ""
									}`}
								>
									<ImageOrPlaceholder
										src={user.image ?? undefined}
										className="h-10 w-10 rounded-lg object-cover"
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium">{user.name}</span>
										<span
											className={`text-start text-xs ${
												active ? "text-white" : "text-light"
											}`}
										>
											{user.email}
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
