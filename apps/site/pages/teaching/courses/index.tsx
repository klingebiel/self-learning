import { authOptions } from "@self-learning/api";
import { trpc } from "@self-learning/api-client";
import { SectionHeader, Tab, Tabs } from "@self-learning/ui/common";
import {
	CourseBasicInformation,
	CourseSkillView,
	CourseModulView,
	CoursePreview
} from "@self-learning/ui/course";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async ctx => {
	const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};
	}

	if (session.user.role !== "ADMIN" && !session.user.isAuthor) {
		return {
			redirect: {
				destination: "/403",
				permanent: false
			}
		};
	}

	return {
		props: {}
	};
};

export default function CourseCreationEditor() {
	const tabs = ["1. Grunddaten", "2. Skillansicht", "3. Modulansicht", "4. Vorschau"];
	const [selectedIndex, setSelectedIndex] = useState(0);

	function switchTab(index: number) {
		setSelectedIndex(index);
	}

	const { data: repositories, isLoading } = trpc.skill.getRepositories.useQuery();

	const repository = repositories?.find(repository => repository.id === "1");

	if (!repositories || !repository) {
		return <div>No repository</div>;
	}

	const renderContent = (index: number) => {
		switch (index) {
			case 0:
				return <CourseBasicInformation />;
			case 1:
				return <CourseSkillView repositories={repositories} repository={repository} />;
			case 2:
				return <CourseModulView />;
			case 3:
				return <CoursePreview />;
			default:
				return null;
		}
	};

	return (
		<div className="m-3">
			<section>
				<SectionHeader title={"Kompetenzerwerbseditor"} subtitle="" />
			</section>
			<Tabs selectedIndex={selectedIndex} onChange={switchTab}>
				{tabs.map((content, idx) => (
					<Tab key={idx}>{content}</Tab>
				))}
			</Tabs>
			<div>{renderContent(selectedIndex)}</div>
		</div>
	);
}
