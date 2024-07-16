import { FaceFrownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { useSession } from "next-auth/react";
import { SearchSection } from "./search-section";
import { useTranslation } from "react-i18next";

function SearchInput({
	searchQuery,
	setSearchQuery
}: {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
}) {
	const { t } = useTranslation();
	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
			</div>
			<input
				autoComplete="off"
				id="search"
				name="search"
				className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-500 lg:text-sm lg:leading-6"
				placeholder={t("search")}
				type="search"
				value={searchQuery}
				onChange={e => {
					setSearchQuery(e.target.value);
				}}
			/>
		</div>
	);
}

function NoResults() {
	const { t } = useTranslation();
	return (
		<div className="px-4 py-8 text-center text-sm sm:px-8">
			<FaceFrownIcon className="mx-auto h-7 w-7 text-gray-400" />
			<p className="mt-4 font-semibold text-gray-900">{t("nothing_here")}</p>
			<p className="mt-2 text-gray-500">{t("search_bar_not_found_text_1")}</p>
			<p className="text-gray-500">{t("search_bar_not_found_text_2")}</p>
		</div>
	);
}

function SearchResults({
	searchQuery,
	resetSearchQuery
}: {
	searchQuery: string;
	resetSearchQuery: () => void;
}) {
	const session = useSession();
	const { t } = useTranslation();
	const user = session.data?.user;
	const search = { title: searchQuery, page: 1 };
	const isUserAdmin = user?.role === "ADMIN";

	const { data: lessons, isLoading: lessonLoading } = trpc.lesson.findMany.useQuery(search);

	const { data: authors, isLoading: authorLoading } = trpc.author.findMany.useQuery(search);
	const authorResults = authors?.result.map(({ displayName: title, slug }) => ({ title, slug }));

	const { data: courses, isLoading: coursesLoading } = trpc.course.findMany.useQuery(search);

	const hasResults =
		(lessons && lessons?.result?.length > 0) ||
		(authors && authors?.result?.length > 0) ||
		(courses && courses?.result?.length > 0);

	// TODO make use of loading circles here when they are implemented
	return (
		<>
			{!hasResults && <NoResults />}
			{courses && (
				<SearchSection
					title={t("courses")}
					results={courses.result}
					baseLink="courses"
					onClick={resetSearchQuery}
				/>
			)}
			{lessons && isUserAdmin && (
				<SearchSection
					title={t("lessons")}
					results={lessons.result}
					baseLink="teaching/lessons/edit"
					onClick={resetSearchQuery}
				/>
			)}

			{authorResults && (
				<SearchSection
					title={t("authors")}
					results={authorResults}
					baseLink="authors"
					onClick={resetSearchQuery}
				/>
			)}
		</>
	);
}

export function SearchBar() {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const resetCallback = () => setSearchQuery("");

	return (
		<div className="hidden flex-1 items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-end">
			<div className="relative w-full max-w-lg lg:max-w-xs">
				<label htmlFor="search" className="sr-only">
					{t("search")}
				</label>
				<SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

				<Transition
					show={true}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					{searchQuery !== "" && (
						<div className="absolute right-0 z-10 mt-2 w-full origin-top-right truncate rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<SearchResults
								searchQuery={searchQuery}
								resetSearchQuery={resetCallback}
							/>
						</div>
					)}
				</Transition>
			</div>
		</div>
	);
}
