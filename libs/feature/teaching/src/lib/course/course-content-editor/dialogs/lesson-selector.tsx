import { Combobox } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { DropdownDialog, Paginator } from "@self-learning/ui/common";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";

export function LessonSelector({
	open,
	onClose
}: {
	open: boolean;
	onClose: (lesson?: LessonSummary) => void;
}) {
	const [title, setTitle] = useState("");
	const [page, setPage] = useState(1);
	const { data } = trpc.lesson.findMany.useQuery(
		{ title, page },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);
	const { t } = useTranslation();

	return (
		<DropdownDialog.Dialog open={open} onClose={onClose}>
			<Combobox value={null} onChange={onClose}>
				<DropdownDialog.SearchInput
					filter={title}
					setFilter={setTitle}
					placeholder={t("not_allowed")}
				/>

				<DropdownDialog.PaginationContainer>
					{data && <Paginator pagination={data} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{data?.result.map(lesson => (
						<Combobox.Option value={lesson} key={lesson.lessonId} as={Fragment}>
							{({ active }) => (
								<button
									type="button"
									className={`flex flex-col gap-1 rounded px-4 py-2 ${
										active ? "bg-secondary text-white" : ""
									}`}
								>
									<span className="text-sm font-medium ">{lesson.title}</span>
									<span
										className={`text-xs font-normal ${
											active ? "text-white" : "text-light"
										}`}
									>
										{t("by")}{" "}
										{lesson.authors.map(a => a.displayName).join(", ")}
									</span>
								</button>
							)}
						</Combobox.Option>
					))}
				</DropdownDialog.Options>
			</Combobox>
		</DropdownDialog.Dialog>
	);
}

export type LessonSummary = { lessonId: string; title: string; slug: string };
