import QuestionPage from "apps/site/pages/courses/[courseSlug]/[lessonSlug]/quiz";
import { getPlaceholderCourse, getPlaceholderLesson } from ".";
import { useEffect, useRef, useState } from "react";
import {
	getCourseById,
	LessonLayout,
	LessonLayoutProps
} from "libs/feature/lesson/src/lib/lesson-layout";
import { GetServerSideProps } from "next";
import { Quiz } from "@self-learning/quiz";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";

function getEmptyQuiz() {
	return {
		questions: [],
		config: null
	};
}
export default function QuizPreview() {
	const [lesson, setLesson] = useState(getPlaceholderLesson(undefined, ""));
	const [quiz, setQuiz] = useState<Quiz>(getEmptyQuiz());
	const [isLoaded, setIsLoaded] = useState(false);
	const [quizMarkdown, setQuizMarkdown] = useState(getEmptyQuizMarkdown());

	const placeholderCourse = getPlaceholderCourse();
	const placeholderLesson = getPlaceholderLesson(undefined, "");
	const lessonRef = useRef(lesson);

	useEffect(() => {
		const fetchLessonData = async () => {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				const lessonData = storedData
					? JSON.parse(storedData)
					: getPlaceholderLesson(undefined, "");
				const quiz = lessonData.quiz;

				setLesson(lessonData);
				setQuiz(quiz);
				setIsLoaded(true);
			}
		};

		fetchLessonData();
	}, []);

	useEffect(() => {
		const compileMarkdownData = async () => {
			if (lesson === lessonRef.current) {
				return;
			}
			const questionsMd: MdLookup = {};
			const answersMd: MdLookup = {};
			const hintsMd: MdLookupArray = {};

			if (quiz.questions) {
				for (const question of quiz.questions) {
					questionsMd[question.questionId] = await compileMarkdown(question.statement);
					if (question.hints?.length > 0) {
						hintsMd[question.questionId] = [];

						for (const hint of question.hints) {
							hintsMd[question.questionId].push(await compileMarkdown(hint.content));
						}
					}
					if (question.type === "multiple-choice") {
						for (const answer of question.answers) {
							answersMd[answer.answerId] = await compileMarkdown(answer.content);
						}
					}
				}
			}
			setQuizMarkdown({
				questionsMd: questionsMd,
				answersMd: answersMd,
				hintsMd: hintsMd
			});
			lessonRef.current = lesson;
		};

		compileMarkdownData();
	}, [lesson]);

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	return (
		<QuestionPage
			course={placeholderCourse}
			lesson={placeholderLesson}
			quiz={quiz}
			markdown={quizMarkdown}
			isPreview={true}
		/>
	);
}
function getEmptyQuizMarkdown() {
	return {
		questionsMd: {},
		answersMd: {},
		hintsMd: {}
	};
}
type QuestionProps = LessonLayoutProps & {
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup | null;
		answersMd: MdLookup | null;
		hintsMd: MdLookupArray | null;
	};
};

function getValueFromQuery(value: string[] | string | undefined) {
	let result = "";

	if (typeof value === "string") {
		result = value;
	} else if (Array.isArray(value) && value.length > 0) {
		result = value[0];
	}
	return result;
}
export const getServerSideProps: GetServerSideProps<QuestionProps> = async ({ query }) => {
	const lessonId = query.lessonId ? getValueFromQuery(query.lessonId) : "";
	const lessonTitle = query.title ? getValueFromQuery(query.title) : "";
	const courseId = query.courseId ? getValueFromQuery(query.courseId) : "placeholder";

	let course = await getCourseById(courseId);
	if (!course) {
		course = getPlaceholderCourse();
	}

	const props = {
		lesson: getPlaceholderLesson(lessonTitle, lessonId),
		course: course
	};
	const quiz: Quiz = {
		questions: [],
		config: null
	};
	//
	const markdown = getEmptyQuizMarkdown();
	return {
		props: {
			...props,
			quiz,
			markdown: markdown
		}
	};
};

QuizPreview.getLayout = LessonLayout;
