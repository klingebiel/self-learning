import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import Link from "next/link";
import { ReactComponent as EnvStudySvg } from "../../svg/environmental-study.svg";
import { ReactComponent as SoftwareEngineerSvg } from "../../svg/software-engineer.svg";
import { ReactComponent as PersonalInformationSvg } from "../../svg/teams.svg";
import { ReactComponent as TutorialSvg } from "../../svg/tutorial.svg";
import { useTranslation } from "react-i18next";

export default function AdminPage() {
	const { t } = useTranslation();
	const session = useRequiredSession();

	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">{t("management")}</h1>

			<div className="grid grid-cols-2 gap-8">
				<Card
					href="/admin/lessons"
					imageElement={<TutorialSvg />}
					title={t("manage_lessons")}
				/>

				<Card
					href="/admin/courses"
					imageElement={<SoftwareEngineerSvg />}
					title={t("manage_courses")}
				/>

				<Card
					href="/admin/subjects"
					imageElement={<EnvStudySvg />}
					title={t("manage_subjects")}
				/>

				<Card
					href="/admin/authors"
					imageElement={<PersonalInformationSvg />}
					title={t("manage_authors")}
				/>
				<Card
					href="/admin/licenses"
					imageElement={<PersonalInformationSvg />}
					title={t("manage_licenses")}
				/>
			</div>
		</CenteredSection>
	);
}

function Card({
	imageElement,
	title,
	href
}: {
	imageElement: React.ReactNode;
	title: string;
	href: string;
}) {
	return (
		<Link
			href={href}
			className="flex flex-col place-items-center gap-4 rounded-lg border border-light-border bg-white pt-4"
		>
			<div className="flex aspect-square h-32 w-32">{imageElement}</div>
			<span className="w-full rounded-b-lg bg-secondary p-4 text-center font-semibold text-white">
				{title}
			</span>
		</Link>
	);
}
