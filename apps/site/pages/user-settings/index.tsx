import { withAuth } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import {
	DeleteMeForm,
	FeatureSettingsForm,
	getUserWithSettings,
	PersonalSettingsForm
} from "@self-learning/settings";
import { ResolvedValue } from "@self-learning/types";
import { showToast } from "@self-learning/ui/common";
import { CenteredSection } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

interface PageProps {
	settings: NonNullable<ResolvedValue<typeof getUserWithSettings>>;
}

export const getServerSideProps: GetServerSideProps<PageProps> = withAuth<PageProps>(
	async (context, user) => {
		const settings = await getUserWithSettings(user.name);
		const { locale } = context;

		if (!settings) {
			return {
				notFound: true
			};
		}

		return {
			props: {
				...(await serverSideTranslations(locale ?? "en", ["common"])),
				settings
			}
		};
	}
);

export default function SettingsPage(props: PageProps) {
	const [settings, setSettings] = useState(props.settings);
	const { mutateAsync: updateSettings } = trpc.me.updateSettings.useMutation();

	const router = useRouter();

	const onPersonalSettingSubmit: Parameters<
		typeof PersonalSettingsForm
	>[0]["onSubmit"] = async update => {
		if (!update) return;
		try {
			setSettings(prev => {
				const newSettings = { ...prev, ...update };
				updateSettings({ user: newSettings });
				return newSettings;
			});
			showToast({
				type: "success",
				title: "Informationen aktualisiert",
				subtitle: update.displayName
			});
			router.replace(router.asPath);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
			}
		}
	};

	const onFeatureChange: Parameters<typeof FeatureSettingsForm>[0]["onChange"] = async update => {
		try {
			if (!update) return;

			setSettings(prev => {
				const newSettings = { ...prev, ...update };
				updateSettings({ user: newSettings });
				return newSettings;
			});
		} catch (error) {
			if (error instanceof Error) {
				showToast({
					type: "error",
					title: "Aktuelle Einstellungen konnten nicht gespeichert werden!",
					subtitle: error.message ?? ""
				});
			}
		}
	};
	console.log("settings", settings);
	return (
		<CenteredSection className="bg-gray-50">
			<h1 className="text-2xl font-bold">Einstellungen</h1>
			<SettingSection title="Profil">
				<PersonalSettingsForm
					personalSettings={settings}
					onSubmit={onPersonalSettingSubmit}
				/>
			</SettingSection>
			<SettingSection title="Funktionen">
				<FeatureSettingsForm featureSettings={settings} onChange={onFeatureChange} />
			</SettingSection>
			<SettingSection title="Kritischer Bereich">
				<DeleteMeForm />
			</SettingSection>
		</CenteredSection>
	);
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="space-y-4 mt-8 rounded-lg border bg-gray-100 p-6">
			<h3>{title}</h3>
			{children}
		</section>
	);
}
