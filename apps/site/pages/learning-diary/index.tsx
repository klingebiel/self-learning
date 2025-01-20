import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@self-learning/api";
import { database } from "@self-learning/database";
import { ResolvedValue } from "@self-learning/types";
import {
	SortIndicator,
	TableDataColumn,
	TableHeaderColumn,
	TableVisibilityDropdown
} from "@self-learning/ui/common";
import { UniversalSearchBar } from "@self-learning/ui/layouts";
import { formatTimeIntervalToString } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function findMandyLtb({ username }: { username: string }) {
	const entries = await database.learningDiaryPage.findMany({
		where: { studentName: username },
		select: {
			id: true,
			createdAt: true,
			scope: true,
			course: { select: { title: true, slug: true, authors: true } },
			learningLocation: { select: { name: true } },
			totalDurationLearnedMs: true,
			techniqueRatings: {
				select: {
					technique: {
						select: {
							name: true,
							strategy: { select: { id: true, name: true } }
						}
					}
				}
			}
		},
		orderBy: {
			createdAt: "asc"
		}
	});
	return entries.map((entry, index) => ({
		...entry,
		pageCount: index + 1
	}));
}

export type LearningDiaryPageOverview = ResolvedValue<typeof findMandyLtb>[number];

export const getServerSideProps: GetServerSideProps = withAuth(async (context, user) => {
	const { locale } = context;

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			learningDiaryEntries: await findMandyLtb({
				username: user.name
			})
		}
	};
});

export default function LearningDiaryOverview({
	learningDiaryEntries
}: {
	learningDiaryEntries: LearningDiaryPageOverview[];
}) {
	const [searchQuarry, setSearchQuarry] = useState<string>("");

	return (
		<div className="flex w-full justify-center">
			<div className="w-3/5">
				<div className="py-2">
					<UniversalSearchBar
						searchQuery={searchQuarry}
						setSearchQuery={setSearchQuarry}
						placeHolder={"Lerntagebucheinträge durchsuchen..."}
					/>
				</div>
				<div className="py-2">
					<SortedTable
						learningDiaryEntries={learningDiaryEntries}
						searchQuarry={searchQuarry}
					/>
				</div>
			</div>
		</div>
	);
}

const sortableColumns = {
	pageCount: {
		label: "Nr.",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) =>
			a.pageCount - b.pageCount,
		isDisplayed: true
	},
	course: {
		label: "Kurs",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) =>
			a.course.title.localeCompare(b.course.title),
		isDisplayed: true
	},
	date: {
		label: "Datum",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) =>
			a.createdAt.getTime() - b.createdAt.getTime(),
		isDisplayed: true
	},
	duration: {
		label: "Dauer",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) =>
			(a.totalDurationLearnedMs ?? 0) - (b.totalDurationLearnedMs ?? 0),
		isDisplayed: true
	},
	learningLocation: {
		label: "Lernort",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) => {
			if (a.learningLocation && b.learningLocation) {
				return a.learningLocation.name.localeCompare(b.learningLocation.name);
			}
			return 0;
		},
		isDisplayed: false
	},
	learningStrategie: {
		label: "Lernstrategie",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) => {
			const aa = a.techniqueRatings.map(rating => rating.technique.strategy.name).join(", ");
			const bb = b.techniqueRatings.map(rating => rating.technique.strategy.name).join(", ");
			return aa.localeCompare(bb);
		},
		isDisplayed: false
	},
	learningTechnique: {
		label: "Lerntechnik",
		sortingFunction: (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) => {
			const techniquesA = a.techniqueRatings.map(rating => rating.technique.name).join(", ");
			const techniquesB = b.techniqueRatings.map(rating => rating.technique.name).join(", ");
			return techniquesA.localeCompare(techniquesB);
		},
		isDisplayed: false
	}
};

function getFilterFunction(learningDiaryEntry: LearningDiaryPageOverview, query: string): boolean {
	if (query === "") {
		return true;
	}

	const lowercasedQuery = query.toLowerCase();
	const { title, slug, authors } = learningDiaryEntry.course;
	const authorNames = authors.map(author => author.displayName.toLowerCase());
	const ratings = learningDiaryEntry.techniqueRatings;

	const techniqueNames = ratings.map(rating => rating.technique.name.toLowerCase());

	const stringsToCheck = [
		title.toLowerCase(),
		slug.toLowerCase(),
		...authorNames,
		learningDiaryEntry.pageCount.toString().toLowerCase(),
		learningDiaryEntry.learningLocation?.name.toLowerCase() ?? "",
		learningDiaryEntry.scope.toString().toLowerCase(),
		...techniqueNames,
		formatTimeIntervalToString(learningDiaryEntry.totalDurationLearnedMs ?? 0).toLowerCase()
	];

	return stringsToCheck.some(str => str.includes(lowercasedQuery));
}

function SortedTable({
	learningDiaryEntries,
	searchQuarry
}: {
	learningDiaryEntries: LearningDiaryPageOverview[];
	searchQuarry: string;
}) {
	const router = useRouter();

	const [chevronMenu, setChevronMenu] = useState<boolean>(false);
	const [columns, setColumns] = useState(sortableColumns);
	const [sortConfig, setSortConfig] = useState<{
		key: string;
		direction: "ascending" | "descending";
	}>({ key: "pageCount", direction: "ascending" });

	function sortColumnFunc() {
		const sortingFunction = Object.entries(columns).find(
			([key, _column]) => key === sortConfig.key
		)?.[1].sortingFunction;

		if (!sortingFunction) {
			return () => 0; // Default in case a column has no sorting function
		}

		return (a: LearningDiaryPageOverview, b: LearningDiaryPageOverview) => {
			const result = sortingFunction(a, b);
			return sortConfig.direction === "ascending" ? -result : result;
		};
	}

	const setSortOrder = (key: string) => {
		setSortConfig({
			key,
			direction:
				sortConfig.key === key && sortConfig.direction === "ascending"
					? "descending"
					: "ascending"
		});
	};

	return (
		<div>
			<div className="overflow-y-auto rounded-lg border-x border-b border-light-border bg-white">
				<table className="w-full table-auto">
					<thead className="top-0 z-10 rounded-lg border-y border-light-border bg-gray-100">
						<tr>
							{Object.entries(columns)
								.filter(([_, column]) => column.isDisplayed)
								.map(([key, column]) => (
									<TableHeaderColumn key={key} onClick={() => setSortOrder(key)}>
										{column.label}{" "}
										<SortIndicator columnId={key} sortConfig={sortConfig} />
									</TableHeaderColumn>
								))}

							<th
								className="cursor-pointer border-y border-light-border py-4 px-8 text-start text-sm font-semibold"
								key="chevron"
								onClick={() => {
									setChevronMenu(true);
								}}
								onMouseLeave={() => {
									setChevronMenu(false);
								}}
							>
								<div className="flex justify-between">
									<ChevronDoubleDownIcon className="h-5 w-5 stroke-current stroke-2 text-black" />
								</div>
								{chevronMenu && (
									<TableVisibilityDropdown
										columns={columns}
										onChange={({ key, column }) =>
											setColumns(prev => ({ ...prev, [key]: column }))
										}
										onMouseLeave={() => setChevronMenu(false)}
									/>
								)}
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-light-border">
						{learningDiaryEntries
							.slice()
							.filter(entry => getFilterFunction(entry, searchQuarry))
							.sort(sortColumnFunc())
							.map(learningDiaryEntry => (
								<tr
									key={learningDiaryEntry.id}
									onClick={() => {
										router.push(
											"/learning-diary/page/" + learningDiaryEntry.id
										);
									}}
									className={"cursor-pointer hover:bg-gray-100"}
								>
									{Object.entries(columns)
										.filter(([_, column]) => column.isDisplayed)
										.map(([key, column]) => {
											return (
												<TableDataColumn key={column.label}>
													{key === "pageCount" &&
														learningDiaryEntry.pageCount}

													{key === "course" && (
														<div>
															<span className="flex items-center justify-center text-gray-800 hover:text-secondary">
																<span className="truncate">
																	{
																		learningDiaryEntry.course
																			.title
																	}
																</span>
															</span>
														</div>
													)}

													{key === "duration" &&
														formatTimeIntervalToString(
															learningDiaryEntry.totalDurationLearnedMs ??
																0
														)}

													{key === "learningLocation" &&
														learningDiaryEntry.learningLocation?.name}

													{key === "learningStrategie" &&
														learningDiaryEntry.techniqueRatings
															.map(
																rating =>
																	rating.technique.strategy.name
															)
															.filter(
																(value, index, self) =>
																	self.indexOf(value) === index
															)
															.join(", ")}

													{key === "learningTechnique" &&
														learningDiaryEntry.techniqueRatings
															.map(rating => rating.technique.name)
															.join(", ")}

													{key === "scope" && learningDiaryEntry.scope}
												</TableDataColumn>
											);
										})}
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
