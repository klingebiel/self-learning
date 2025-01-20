import { withAuth } from "@self-learning/api";
import {
	allPages,
	DiaryContentForm,
	getAllStrategies,
	PageChanger,
	PagesMeta,
	Sidebar,
	Strategy
} from "@self-learning/diary";
import { Divider } from "@self-learning/ui/common";
import { subMilliseconds } from "date-fns";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps = withAuth(async (context, user) => {
	const { locale } = context;
	const pageId = context.params?.pageId;
	const pages = await allPages(user.name);
	const availableStrategies = await getAllStrategies();

	const pageExists = pages.some(page => page.id === pageId);
	if (!pageExists) {
		return {
			notFound: true
		};
	}

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			diaryId: pageId,
			pages,
			availableStrategies
		}
	};
});

export default function DiaryPageDetail({
	diaryId,
	pages,
	availableStrategies
}: {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}) {
	// Identify the end date of the page, required for computations / filtering of details
	const index = pages.findIndex(page => page.id === diaryId);
	let endDate = index >= 0 && index < pages.length - 1 ? pages[index + 1].createdAt : new Date();
	endDate = subMilliseconds(endDate, 1); // subtract 1 ms to avoid fetching data of the next page

	return (
		<div className="flex flex-col">
			<div className="mx-auto flex w-full flex-col gap-8 px-4 sm:flex-col-reverse xl:grid xl:grid-cols-[400px_1fr]">
				<div className="w-full">
					<Sidebar selectedPageId={diaryId} pages={pages} />
				</div>

				<div className="w-full py-4 sm:w-2/3 mx-auto">
					<div className="mb-4 flex justify-center">
						<PageChanger key={diaryId} pages={pages} currentPageId={diaryId} />
					</div>

					<Divider />
					<DiaryContentForm
						key={diaryId}
						diaryId={diaryId}
						availableStrategies={availableStrategies}
						endDate={endDate}
					/>
				</div>
			</div>
		</div>
	);
}
