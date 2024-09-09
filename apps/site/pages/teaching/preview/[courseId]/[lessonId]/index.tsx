import { LessonLayout, getCourseById } from "libs/feature/lesson/src/lib/lesson-layout";
import Lesson from "apps/site/pages/courses/[courseSlug]/[lessonSlug]";
import { LessonType } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import React from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import { LessonContent, findContentType } from "@self-learning/types";
import { useRouter } from "next/router";

export function getEmptyMarkdown() {
	return {
		article: null,
		description: null,
		preQuestion: null,
		subtitle: null
	};
}

export function getPlaceholderCourse() {
	return {
		courseId: "placeholder",
		title: "Platzhalter-Kurs",
		slug: "placeholder"
	};
}

export function getPlaceholderLesson(title: string | string[] | undefined, id: string | undefined) {
	const lessonId = id ? id : "";

	let lessonTitle = "Platzhalter-Lerneinheit";
	if (title) {
		if (typeof title === "string") {
			lessonTitle = title;
		} else {
			lessonTitle = title[0];
		}
	}

	return {
		lessonType: LessonType.TRADITIONAL,
		quiz: null,
		meta: { hasQuiz: false, mediaTypes: {} },
		content: [],
		title: lessonTitle,
		slug: "",
		description: "",
		lessonId: lessonId,
		subtitle: "",
		authors: [],
		selfRegulatedQuestion: "",
		license: { name: "", url: "", logoUrl: "", licenseText: "", oerCompatible: true }
	};
}

type MarkdownContent = {
	description: MDXRemoteSerializeResult | null;
	subtitle: MDXRemoteSerializeResult | null;
	article: MDXRemoteSerializeResult | null;
	preQuestion: MDXRemoteSerializeResult | null;
};

export default function LessonPreview() {
	const [lesson, setLesson] = useState(getPlaceholderLesson(undefined, ""));
	const [markdown, setMarkdown] = useState<MarkdownContent>(getEmptyMarkdown());

	const lessonRef = useRef(lesson); // store the previous lesson state
	const router = useRouter();

	useEffect(() => {
		const fetchLessonData = async () => {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				const lessonData = storedData
					? JSON.parse(storedData)
					: getPlaceholderLesson(undefined, "");
				setLesson(lessonData);
			}
		};

		fetchLessonData();
	}, []);

	useEffect(() => {
		const compileMarkdownData = async () => {
			if (lesson === lessonRef.current) {
				return;
			}

			const mdDescription = lesson.description
				? await compileMarkdown(lesson.description)
				: null;

			const mdSubtitle = lesson.subtitle ? await compileMarkdown(lesson.subtitle) : null;

			const { content: article } = findContentType(
				"article",
				lesson.content as LessonContent
			);
			const mdArticle = article ? await compileMarkdown(article.value.content) : null;

			setMarkdown({
				description: mdDescription,
				subtitle: mdSubtitle,
				article: mdArticle,
				preQuestion: null
			});
			lessonRef.current = lesson;
		};

		compileMarkdownData();
	}, [lesson]);

	function redirectBackToEditor() {
		let path = `/teaching/lessons/edit/${lesson.lessonId}?fromPreview=${true}`;
		if (lesson.lessonId === "") {
			path = `/teaching/lessons/create?fromPreview=${true}`;
		}

		router.push(path);
	}

	return (
		<>
			<div>
				<button className="btn-stroked my-2 w-full" onClick={redirectBackToEditor}>
					Zurück zum Editor
				</button>
			</div>
			<Lesson
				lesson={lesson}
				course={getPlaceholderCourse()}
				markdown={markdown}
				isPreview={true}
			/>
		</>
	);
}
type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
};

export function getValueFromQuery(value: string[] | string | undefined) {
	let result = "";

	if (typeof value === "string") {
		result = value;
	} else if (Array.isArray(value) && value.length > 0) {
		result = value[0];
	}
	return result;
}

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ query }) => {
	const lessonId = query.lessonId ? getValueFromQuery(query.lessonId) : "";
	const lessonTitle = query.lessonTitle ? getValueFromQuery(query.lessonTitle) : "";
	const courseId = query.courseId ? getValueFromQuery(query.courseId) : "placeholder";

	let course = await getCourseById(courseId);
	if (!course) {
		course = getPlaceholderCourse();
	}

	const props = { lesson: getPlaceholderLesson(lessonTitle, lessonId), course: course };

	return {
		props: {
			...props,
			markdown: getEmptyMarkdown()
		}
	};
};

LessonPreview.getLayout = LessonLayout;
