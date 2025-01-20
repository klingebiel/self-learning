import { withAuth } from "@self-learning/api";
import { getLearningGoals, LearningGoals } from "@self-learning/diary";
import { ResolvedValue } from "@self-learning/types";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type Goals = ResolvedValue<typeof getLearningGoals>;

export const getServerSideProps: GetServerSideProps = withAuth(async (context, user) => {
	const { locale } = context;

	const goals = await getLearningGoals(user.name);
	return {
		props: { ...(await serverSideTranslations(locale ?? "en", ["common"])), goals }
	};
});

export default function LearningGoal({ goals }: { goals: Goals }) {
	return <LearningGoals goals={goals} onStatusUpdate={_ => {}} />;
}
