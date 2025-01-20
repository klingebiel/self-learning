import { AdminGuard, CenteredSection, useRequiredSession } from "@self-learning/ui/layouts";
import { CodingSvg, EnvStudySvg } from "@self-learning/ui/static";
import { SoftwareEngineerSvg } from "@self-learning/ui/static";
import { PersonalInformationSvg } from "@self-learning/ui/static";
import { TutorialSvg } from "@self-learning/ui/static";
import { Card } from "@self-learning/ui/common";

export default function AdminPage() {
	const session = useRequiredSession();
	const appVersion = process.env.APP_VERSION || "Version not available";

	if (session.data?.user.role !== "ADMIN") {
		return <AdminGuard></AdminGuard>;
	}

	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="mb-16 text-5xl">Verwaltung</h1>

			<div className="grid grid-cols-2 gap-8">
				<Card
					href="/admin/lessons"
					imageElement={<TutorialSvg />}
					title="Lerneinheiten verwalten"
				/>

				<Card
					href="/admin/courses"
					imageElement={<SoftwareEngineerSvg />}
					title="Kurse verwalten"
				/>

				<Card
					href="/admin/subjects"
					imageElement={<EnvStudySvg />}
					title="Fachgebiete verwalten"
				/>

				<Card
					href="/admin/authors"
					imageElement={<PersonalInformationSvg />}
					title="Autoren verwalten"
				/>
				<Card
					href="/admin/licenses"
					imageElement={<PersonalInformationSvg />}
					title="Lizenzen verwalten"
				/>
				<Card
					href="/admin/users"
					imageElement={<PersonalInformationSvg />}
					title="Nutzer:innen verwalten"
				/>
				<Card
					href="/admin/api-docs"
					imageElement={<CodingSvg />}
					title="REST API Dokumentation (OpenAPI)"
				/>
			</div>
			<div className="text-center text-sm text-gray-500 mt-8">
				{`App Version: ${appVersion}`}
			</div>
		</CenteredSection>
	);
}
