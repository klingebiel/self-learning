import { StudyingSvg } from "@self-learning/ui/static";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getServerSideProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"]))
		}
	};
}

export function LandingPage() {
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
							Willkommen auf der Selbstlernplattform der{" "}
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
							Lerninhalte entdecken
						</Link>

						<ul className="text-md mt-12 flex list-inside list-disc flex-col gap-6">
							<li>
								Auf der Plattform werden dir studiengangbezogene Lerninhalte in
								individualisierten und flexiblen Lernpfaden, bestehend aus kleinen
								Lerneinheiten, präsentiert.
							</li>
							<li>Diese kannst du in deinem eigenen Tempo lernen und wiederholen.</li>

							<li>
								Während du einen Lernpfad durchläufst, erhältst du Feedback zu
								deinem Lernfortschritt und Hinweise, wie du Lernstrategien anwenden
								kannst, um dein Lernen zu verbessern.
							</li>

							<li>
								Unsere Mission ist, dass du durch die Plattform lernst, strategisch
								und nachhaltig zu lernen.
							</li>
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
