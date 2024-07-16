import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import {
	ImageOrPlaceholder,
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn
} from "@self-learning/ui/common";
import { SearchField } from "@self-learning/ui/forms";
import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CoursesPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { page = 1, title = "" } = router.query;
	const [titleFilter, setTitle] = useState(title);
	const { data } = trpc.course.findMany.useQuery(
		{ title: titleFilter as string, page: Number(page) },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);

	useEffect(() => {
		// We need this effect, because router.query is empty on first render
		setTitle(title as string);
	}, [title]);

	const session = useRequiredSession();
	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<div className="mb-16 flex items-center justify-between gap-4">
				<h1 className="text-5xl">{t("course")}</h1>

				<Link href="/teaching/courses/create" className="btn-primary flex w-fit">
					<PlusIcon className="h-5" />
					<span>{t("add_course")}</span>
				</Link>
			</div>

			<SearchField
				placeholder={t("search_for_title")}
				onChange={e => setTitle(e.target.value)}
			/>

			<Table
				head={
					<>
						<TableHeaderColumn></TableHeaderColumn>
						<TableHeaderColumn>{t("title")}</TableHeaderColumn>
						<TableHeaderColumn>{t("by")}</TableHeaderColumn>
					</>
				}
			>
				{data?.result.map(course => (
					<tr key={course.courseId}>
						<TableDataColumn>
							<ImageOrPlaceholder
								src={course.imgUrl ?? undefined}
								className="h-16 w-24 rounded-lg object-cover"
							/>
						</TableDataColumn>

						<TableDataColumn>
							<Link
								className="text-sm font-medium hover:text-secondary"
								href={`/teaching/courses/edit/${course.courseId}`}
							>
								{course.title}
							</Link>
						</TableDataColumn>

						<TableDataColumn>
							<span className="text-light">
								{course.authors.map(a => a.displayName).join(", ")}
							</span>
						</TableDataColumn>
					</tr>
				))}
			</Table>

			{data?.result && (
				<Paginator pagination={data} url={`/admin/courses?title=${titleFilter}`} />
			)}
		</CenteredSection>
	);
}
