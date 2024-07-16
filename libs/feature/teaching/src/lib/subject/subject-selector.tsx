import { Combobox } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, ImageOrPlaceholder, OnDialogCloseFn } from "@self-learning/ui/common";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Dialog that allows the user to select an author from a list of authors.
 */
export function SpecializationSelector({
	onClose,
	open
}: {
	open: boolean;
	onClose: OnDialogCloseFn<{ specializationId: string; title: string }>;
}) {
	const { t } = useTranslation();
	const { data: subjects } = trpc.subject.getAllWithSpecializations.useQuery();
	const [filter, setFilter] = useState("");

	const filtered = useMemo(() => {
		if (!subjects) return [];

		if (!filter || filter === "") {
			return subjects;
		}

		const lcFilter = filter.toLowerCase();

		return subjects.map(subject => ({
			...subject,
			specializations: subject.specializations.filter(s =>
				s.title.toLowerCase().includes(lcFilter)
			)
		}));
	}, [filter, subjects]);

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null} onChange={onClose}>
				<DropdownDialog.SearchInput
					filter={filter}
					setFilter={setFilter}
					placeholder={t("search_for_specialization")}
				/>

				<DropdownDialog.Options>
					{filtered?.map(subject => (
						<div key={subject.subjectId} className="flex flex-col">
							<span className="bg-gray-100 px-4 py-2 text-sm font-semibold">
								{subject.title}
							</span>
							<ul className="flex flex-col divide-y divide-light-border">
								{subject.specializations.map(spec => (
									<Combobox.Option
										value={spec}
										key={spec.specializationId}
										as={Fragment}
									>
										{({ active }) => (
											<button
												type="button"
												className={`flex items-center gap-4 rounded pr-4 ${
													active ? "bg-secondary text-white" : ""
												}`}
											>
												<ImageOrPlaceholder
													src={spec.cardImgUrl ?? undefined}
													className="h-10 w-10 bg-white object-cover"
												/>
												<span className="text-sm font-medium">
													{spec.title}
												</span>
											</button>
										)}
									</Combobox.Option>
								))}
							</ul>
						</div>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}
