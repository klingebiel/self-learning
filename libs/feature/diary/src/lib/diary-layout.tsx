import { NextComponentType, NextPageContext } from "next";
import { Sidebar } from "./page-viewer/page-sidebar";
import { PagesMeta, Strategy } from "./access-learning-diary";

interface DiaryProps {
	diaryId: string;
	pages: PagesMeta;
	availableStrategies: Strategy[];
}

export function DiaryLayout(
	Component: NextComponentType<NextPageContext, unknown, DiaryProps>,
	pageProps: DiaryProps
) {
	
	return (
		<div className="flex flex-col">
			<div className="mx-auto flex w-full flex-col gap-8 px-4 sm:flex-col-reverse xl:grid xl:grid-cols-[400px_1fr]">
				<div className="w-full">
					<Sidebar selectedPageId={pageProps.diaryId} pages={pageProps.pages} />
				</div>
				<div className="w-full pt-8 pb-16">
					<Component {...pageProps} />
				</div>
			</div>
		</div>
	);
}
