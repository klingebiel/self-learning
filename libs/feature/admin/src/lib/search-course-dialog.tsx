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

export function SearchCourseDialog({
	open,
	onClose
}: {
	open: boolean;
	onClose: OnDialogCloseFn<{ courseId: string; title: string }>;
}) {
	const { t } = useTranslation();
	const [title, setTitle] = useState("");
	const [page, setPage] = useState(1);
	const { data: courses } = trpc.course.findMany.useQuery(
		{
			page,
			title
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
					filter={title}
					setFilter={setTitle}
					placeholder={t("search_for_course")}
				/>

				<DropdownDialog.PaginationContainer>
					{courses && <Paginator pagination={courses} url="#" onPageChange={setPage} />}
				</DropdownDialog.PaginationContainer>

				<DropdownDialog.Options>
					{courses?.result.map(course => (
						<Combobox.Option value={course} key={course.courseId} as={Fragment}>
							{({ active }) => (
								<button
									type="button"
									data-testid="course-option"
									className={`flex items-center gap-4 rounded px-4 py-2 ${
										active ? "bg-secondary text-white" : ""
									}`}
								>
									<ImageOrPlaceholder
										src={course.imgUrl ?? undefined}
										className="h-10 w-10 rounded-lg object-cover"
									/>
									<div className="flex flex-col gap-1 text-start">
										<span className="text-sm font-medium">{course.title}</span>
										<span
											className={`text-start text-xs ${
												active ? "text-white" : "text-light"
											}`}
										>
											{course.authors.map(a => a.displayName).join(", ")}
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
