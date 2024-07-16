import {
	CheckCircleIcon as CheckCircleIconOutline,
	XCircleIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, PlayIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { useMarkAsCompleted } from "@self-learning/completion";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { compileMarkdown, MdLookup, MdLookupArray } from "@self-learning/markdown";
import { QuizContent } from "@self-learning/question-types";
import { defaultQuizConfig, Question, Quiz, QuizProvider, useQuiz } from "@self-learning/quiz";
import { Dialog, DialogActions, OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type QuestionProps = LessonLayoutProps & {
	quiz: Quiz;
	markdown: {
		questionsMd: MdLookup;
		answersMd: MdLookup;
		hintsMd: MdLookupArray;
	};
};

export const getServerSideProps: GetServerSideProps<QuestionProps> = async ({ params }) => {
	const parentProps = await getStaticPropsForLayout(params);

	if ("notFound" in parentProps) return { notFound: true };

	const quiz = parentProps.lesson.quiz as Quiz | null;
	if (!quiz) return { notFound: true };

	const questionsMd: MdLookup = {};
	const answersMd: MdLookup = {};
	const hintsMd: MdLookupArray = {};
	type QuestionList = typeof quiz.questions;
	const processedQuestions: QuestionList = [];

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
		processedQuestions.push(question);
	}

	quiz.questions = processedQuestions;

	return {
		props: {
			...parentProps,
			quiz,
			markdown: {
				questionsMd,
				answersMd,
				hintsMd
			}
		}
	};
};

export default function QuestionsPage({ course, lesson, quiz, markdown }: QuestionProps) {
	const { questions, config } = quiz;
	const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
	const router = useRouter();
	const { index } = router.query;
	const [nextIndex, setNextIndex] = useState(1);
	// const hasPrevious = nextIndex > 1;
	// const hasNext = nextIndex < questions.length;

	const goToNextQuestion = useCallback(() => {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex}`, undefined, {
			shallow: true
		});
	}, [nextIndex, course.slug, lesson.slug, router]);
	// function goToPreviousQuestion() {
	// 	router.push(
	// 		`/courses/${course.slug}/${lesson.slug}/quiz?index=${nextIndex - 2}`,
	// 		undefined,
	// 		{
	// 			shallow: true
	// 		}
	// 	);
	// }

	function goToQuestion(index: number) {
		router.push(`/courses/${course.slug}/${lesson.slug}/quiz?index=${index}`, undefined, {
			shallow: true
		});
	}

	useEffect(() => {
		const indexNumber = Number(index);

		if (Number.isFinite(indexNumber) && indexNumber < questions.length) {
			setCurrentQuestion(questions[indexNumber]);
			setNextIndex(Number(index) + 1);
		} else {
			setCurrentQuestion(questions[0]);
			setNextIndex(1);
		}
	}, [index, questions]);

	return (
		<QuizProvider
			questions={questions}
			config={config ?? defaultQuizConfig}
			goToNextQuestion={goToNextQuestion}
			reload={router.reload}
		>
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full flex-col gap-4">
					<QuizHeader
						lesson={lesson}
						course={course}
						currentIndex={nextIndex - 1}
						goToQuestion={goToQuestion}
						questions={questions}
					/>
					<Question
						key={currentQuestion.questionId}
						question={currentQuestion}
						markdown={markdown}
						lesson={lesson}
					/>
					<QuizCompletionSubscriber lesson={lesson} course={course} />
				</div>
			</div>
		</QuizProvider>
	);
}

/** Component that listens to the `completionState` and marks lesson as completed, when quiz is `completed`. */
function QuizCompletionSubscriber({
	lesson,
	course
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
}) {
	const { completionState } = useQuiz();
	const unsubscribeRef = useRef(false);
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);

	useEffect(() => {
		if (!unsubscribeRef.current && completionState === "completed") {
			unsubscribeRef.current = true;
			console.log("QuizCompletionSubscriber: Marking as completed");
			markAsCompleted();
		}
	}, [completionState, markAsCompleted]);

	return <></>;
}

QuestionsPage.getLayout = LessonLayout;

function QuizHeader({
	lesson,
	course,
	questions,
	currentIndex,
	goToQuestion
}: {
	lesson: QuestionProps["lesson"];
	course: QuestionProps["course"];
	currentIndex: number;
	questions: QuizContent;
	goToQuestion: (index: number) => void;
}) {
	const { chapterName, nextLesson } = useLessonContext(lesson.lessonId, course.slug);
	const { evaluations, completionState } = useQuiz();
	const successDialogOpenedRef = useRef(false);
	const failureDialogOpenedRef = useRef(false);
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);
	const [showFailureDialog, setShowFailureDialog] = useState(false);

	if (!successDialogOpenedRef.current && completionState === "completed") {
		successDialogOpenedRef.current = true;
		setShowSuccessDialog(true);
	}

	if (!failureDialogOpenedRef.current && completionState === "failed") {
		failureDialogOpenedRef.current = true;
		setShowFailureDialog(true);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="relative flex flex-col gap-2">
				<span className="font-semibold text-secondary">{chapterName}</span>
				<Link href={`/courses/${course.slug}/${lesson.slug}`}>
					<h1 className="text-4xl">{lesson.title}</h1>
				</Link>
			</div>

			<Tabs onChange={goToQuestion} selectedIndex={currentIndex}>
				{questions.map((question, index) => (
					<Tab key={question.questionId}>
						<QuestionTab
							index={index}
							evaluation={evaluations[question.questionId]}
							isMultiStep={
								lesson.lessonType === LessonType.SELF_REGULATED &&
								question.type === "multiple-choice"
							}
						/>
					</Tab>
				))}
			</Tabs>

			{showSuccessDialog && (
				<QuizCompletionDialog
					course={course}
					lesson={lesson}
					nextLesson={nextLesson}
					onClose={() => {
						setShowSuccessDialog(false);
					}}
				/>
			)}

			{showFailureDialog && (
				<QuizFailedDialog
					lesson={lesson}
					onClose={() => {
						setShowFailureDialog(false);
					}}
				/>
			)}
		</div>
	);
}

function QuestionTab(props: {
	evaluation: { isCorrect: boolean } | null;
	index: number;
	isMultiStep: boolean;
}) {
	const isCorrect = props.evaluation?.isCorrect === true;
	const isIncorrect = props.evaluation?.isCorrect === false;
	const { t } = useTranslation();

	{
		props.isMultiStep && <CheckCircleIcon className="h-5 text-secondary" />;
	}

	return (
		<span className="flex items-center gap-4">
			{isCorrect ? (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<CheckCircleIcon className="h-5 text-secondary" />
				</QuestionTabIcon>
			) : isIncorrect ? (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<XCircleIcon className="h-5 text-red-500" />
				</QuestionTabIcon>
			) : (
				<QuestionTabIcon isMultiStep={props.isMultiStep}>
					<CheckCircleIconOutline className="h-5 text-gray-400" />
				</QuestionTabIcon>
			)}
			{t("task")}
			<span data-testid="questionTab">
				{t("question")} {props.index + 1}
			</span>
		</span>
	);
}

function QuestionTabIcon({
	children,
	isMultiStep
}: {
	children: React.ReactNode;
	isMultiStep: boolean;
}) {
	return isMultiStep ? (
		<div className="flex overflow-hidden">
			{children}
			{children}
		</div>
	) : (
		<div>{children}</div>
	);
}

function QuizCompletionDialog({
	course,
	lesson,
	nextLesson,
	onClose
}: {
	course: QuestionProps["course"];
	lesson: QuestionProps["lesson"];
	nextLesson: { title: string; slug: string } | null;
	onClose: OnDialogCloseFn<void>;
}) {
	const { t } = useTranslation();
	return (
		<Dialog onClose={onClose} title="Geschafft!" style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-light">
				<p>
					{t("finished_learning_unit_1")}{" "}
					<span className="font-semibold text-secondary">{lesson.title}</span>
					{t("finished_learning_unit_2")}
				</p>

				{nextLesson ? (
					<div className="flex flex-col">
						<p>{t("next_learning_unit")}</p>
						<span className="mt-4 self-center rounded-lg bg-gray-100 px-12 py-4 text-xl font-semibold tracking-tighter text-secondary">
							{nextLesson.title}
						</span>
					</div>
				) : (
					<p>
						{t("no_learning_units_1")}{" "}
						<span className="font-semibold text-secondary">{course.title}</span>
						{t("no_learning_units_2")}
					</p>
				)}
			</div>

			<DialogActions onClose={onClose}>
				{nextLesson && (
					<Link
						href={`/courses/${course.slug}/${nextLesson.slug}`}
						className="btn-primary"
					>
						<span>{t("to_next_learning_unit")}</span>
						<PlayIcon className="h-5 shrink-0" />
					</Link>
				)}
			</DialogActions>
		</Dialog>
	);
}

function QuizFailedDialog({
	lesson,
	onClose
}: {
	lesson: QuestionProps["lesson"];
	onClose: OnDialogCloseFn<void>;
}) {
	const { reload } = useQuiz();
	const { t } = useTranslation();

	return (
		<Dialog onClose={onClose} title={t("quiz_failed")} style={{ maxWidth: "600px" }}>
			<div className="flex flex-col text-sm text-light">
				<p>
					{t("quiz_failed_text_1")}{" "}
					<span className="font-semibold text-secondary">{lesson.title}</span>{" "}
					{t("quiz_failed_text_2")}
				</p>
			</div>

			<DialogActions onClose={onClose}>
				<button className="btn-primary" onClick={reload}>
					<span>{t("try_again")}</span>
					<ArrowPathIcon className="h-5 shrink-0" />
				</button>
			</DialogActions>
		</Dialog>
	);
}
