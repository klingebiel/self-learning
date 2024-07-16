import Link from "next/link";
import { useTranslation } from "react-i18next";

import { ReactComponent as StudyingSvg } from "../svg/studying.svg";

export function LandingPage() {
	const { t } = useTranslation();
	return (
		<div className="flex h-full flex-col gap-16 px-4">
			<div className="relative z-10 mx-auto grid max-w-screen-2xl items-start gap-8 py-8 lg:py-32 xl:grid-cols-2">
				<div className="flex flex-col">
					<h1 className="whitespace-nowrap text-4xl sm:text-6xl lg:text-9xl">
						SELF-le@rning
					</h1>
					<h2 className="mt-4 text-2xl font-light text-slate-400 lg:text-3xl">
						Universität Hildesheim
					</h2>

					<span className="mt-8 flex flex-col text-slate-600 md:text-xl">
						<p className="mb-12 text-xl">
							{t("welcome_message")}{" "}
							<a
								href={"https://www.uni-hildesheim.de/"}
								target="_blank"
								rel="noreferrer"
								className="font-semibold text-secondary hover:underline"
							>
								Universität Hildesheim
							</a>
							!
						</p>

						{/* <Image
							priority
							className="mx-auto object-cover"
							src="/logo-selflearning.png"
							width="256"
							height="256"
							alt=""
						></Image> */}

						<Link
							href="/subjects"
							className="w-fit rounded-lg bg-secondary px-16 py-6 text-center text-lg font-semibold text-white"
						>
							{t("navigate_learning_content")}
						</Link>

						<ul className="text-md mt-12 flex list-inside list-disc flex-col gap-6">
							<li>{t("welcome_info_text_1")}</li>
							<li>{t("welcome_info_text_2")}</li>
							<li>{t("welcome_info_text_3")}</li>
							<li>{t("welcome_info_text_4")}</li>
						</ul>
					</span>
				</div>

				<div
					style={{ height: "384px", width: "384px" }}
					className="animate-blob absolute top-32 right-64 hidden rounded-full bg-green-300 opacity-80 mix-blend-multiply blur-xl filter xl:block"
				></div>

				<div
					style={{ height: "384px", width: "384px" }}
					className="animate-blob animation-delay-3000 absolute right-48 top-64 hidden rounded-full bg-secondary bg-pink-300 opacity-80 mix-blend-multiply blur-xl filter xl:block"
				></div>

				<div
					style={{ height: "384px", width: "384px" }}
					className="animate-blob animation-delay-5000 absolute top-32 right-64 hidden rounded-full bg-sky-300 opacity-80 mix-blend-multiply blur-xl filter xl:block"
				></div>

				<StudyingSvg className="h-128 z-10 hidden xl:block" />
			</div>
		</div>
	);
}

export default LandingPage;
