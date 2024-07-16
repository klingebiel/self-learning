import {
	ChevronDoubleLeftIcon,
	ChevronDoubleRightIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	PlayIcon
} from "@heroicons/react/24/solid";
import { CourseCompletion, extractLessonIds, LessonMeta } from "@self-learning/types";
import { Divider } from "@self-learning/ui/common";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export type PlaylistChapter = {
	title: string;
	content: PlaylistLesson[];
};

export type PlaylistLesson = {
	lessonNr: number;
	lessonId: string;
	slug: string;
	title: string;
	meta: LessonMeta;
	isCompleted: boolean;
};

export type PlaylistContent = PlaylistChapter[];

type PlaylistProps = {
	lesson: {
		lessonId: string;
		slug: string;
		title: string;
		meta: LessonMeta;
	};
	content: PlaylistContent;
	course: {
		title: string;
		slug: string;
	};
	completion?: CourseCompletion;
};

export function Playlist({ content, course, lesson, completion }: PlaylistProps) {
	const [contentWithCompletion, setContentWithCompletion] = useState(content);

	useEffect(() => {
		if (!completion) {
			return;
		}

		for (const chapter of content) {
			for (const lesson of chapter.content) {
				lesson.isCompleted = !!completion.completedLessons[lesson.lessonId];
			}
		}

		setContentWithCompletion([...content]);
	}, [completion, content]);

	return (
		<>
			<PlaylistHeader
				content={content}
				course={course}
				lesson={lesson}
				completion={completion}
			/>
			<div className="flex flex-col gap-12 py-4">
				{contentWithCompletion.map((chapter, index) => (
					<Chapter
						key={index}
						chapter={chapter}
						course={course}
						activeLessonId={lesson.lessonId}
					/>
				))}
			</div>
		</>
	);
}

function Chapter({
	chapter,
	activeLessonId,
	course
}: {
	chapter: PlaylistChapter;
	activeLessonId: string;
	course: PlaylistProps["course"];
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<li className="flex flex-col gap-2">
			<span className="flex justify-between">
				<span className="pl-4 font-semibold tracking-tight" data-testid="chapterTitle">
					{chapter.title}
				</span>
				<button onClick={() => setCollapsed(v => !v)}>
					{collapsed ? (
						<ChevronLeftIcon className="h-5 text-gray-400" />
					) : (
						<ChevronDownIcon className="h-5 text-gray-400" />
					)}
				</button>
			</span>
			{!collapsed && (
				<ul className="flex flex-col">
					{chapter.content.map(x => (
						<Lesson
							key={x.lessonId}
							lesson={x}
							href={`/courses/${course.slug}/${x.slug}`}
							isActive={activeLessonId === x.lessonId}
						/>
					))}
				</ul>
			)}
		</li>
	);
}

function Lesson({
	lesson,
	href,
	isActive
}: {
	lesson: PlaylistLesson;
	href: string;
	isActive: boolean;
}) {
	return (
		<Link
			href={href}
			className={`relative flex items-center overflow-hidden rounded-lg py-1 px-4 hover:bg-gray-200 ${
				isActive ? "bg-gray-200 font-medium text-black" : "text-light"
			}`}
		>
			<span
				style={{ width: lesson.isCompleted ? "2px" : "1px" }}
				className={`absolute h-full ${
					lesson.isCompleted ? "bg-emerald-500" : "bg-gray-300"
				}`}
			></span>
			<span
				className="overflow-hidden text-ellipsis whitespace-nowrap pl-4 text-sm"
				data-testid="lessonTitle"
			>
				{lesson.title}
			</span>
		</Link>
	);
}

function PlaylistHeader({ content, course, lesson, completion }: PlaylistProps) {
	const courseCompletion = completion?.courseCompletion;
	const completionPercentage = courseCompletion?.completionPercentage ?? 0;
	const { t } = useTranslation();

	return (
		<div className="sticky top-0 z-20 flex flex-col gap-4 rounded-lg bg-gray-100 pt-8">
			<div className="flex flex-col gap-2">
				<Link
					href={`/courses/${course.slug}`}
					className="heading text-2xl"
					title={course.title}
				>
					{course.title}
				</Link>
				<span className="text-sm text-light">
					{courseCompletion?.completedLessonCount ?? 0} /{" "}
					{extractLessonIds(content).length} {t("units_finished")}
				</span>
			</div>
			<span className="relative h-5 w-full rounded-lg bg-gray-200">
				<motion.span
					className="absolute left-0 h-5 rounded-lg bg-secondary"
					initial={{ width: 0 }}
					animate={{ width: `${completionPercentage}%` }}
					transition={{ type: "tween" }}
				></motion.span>
				<span
					className={`absolute top-0 w-full px-2 text-start text-sm font-semibold ${
						completionPercentage === 0 ? "text-secondary" : "text-white"
					}`}
				>
					{completionPercentage}%
				</span>
			</span>

			<Divider />

			<CurrentlyPlaying lesson={lesson} content={content} course={course} />

			<Divider />
		</div>
	);
}

function CurrentlyPlaying({ lesson, content, course }: PlaylistProps) {
	const router = useRouter();
	const { t } = useTranslation();

	const currentChapter = useMemo(() => {
		for (const chapter of content) {
			for (const les of chapter.content) {
				if (les.lessonId === lesson.lessonId) {
					return chapter;
				}
			}
		}

		return null;
	}, [content, lesson]);

	const { previous, next } = useMemo(() => {
		const flatLessons = content.flatMap(chapter => chapter.content);
		const lessonIndex = flatLessons.findIndex(l => l.lessonId === lesson.lessonId);

		return {
			previous: lessonIndex > 0 ? flatLessons[lessonIndex - 1] : null,
			next: lessonIndex < flatLessons.length - 1 ? flatLessons[lessonIndex + 1] : null
		};
	}, [content, lesson]);

	function navigateToLesson(lesson: PlaylistLesson) {
		router.push(`/courses/${course.slug}/${lesson.slug}`);
	}

	return (
		<div className="flex flex-col gap-4" data-testid="CurrentlyPlaying">
			<span className="flex items-center gap-2 text-sm">
				<PlayIcon className="h-5 shrink-0 text-secondary" />
				<span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
					{currentChapter?.title}
				</span>
				<span className="text-light">-</span>
				<span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-secondary">
					{lesson.title}
				</span>
			</span>
			<span className="flex justify-between">
				{lesson.meta.hasQuiz && (
					<Link
						href={`/courses/${course.slug}/${lesson.slug}${
							router.pathname.endsWith("quiz") ? "" : "/quiz"
						}`}
						className="btn-primary text-sm"
						data-testid="quizLink"
					>
						{router.pathname.endsWith("quiz")
							? t("to_learn_content")
							: t("to_learn_control")}
					</Link>
				)}

				<span className="flex gap-2">
					<button
						onClick={() => previous && navigateToLesson(previous)}
						disabled={!previous}
						className="rounded-lg border border-light-border p-2 disabled:text-gray-300"
						title={t("previous_lesson")}
						data-testid="previousLessonButton"
					>
						<ChevronDoubleLeftIcon className="h-5" />
					</button>
					<button
						onClick={() => next && navigateToLesson(next)}
						disabled={!next}
						className="rounded-lg border border-light-border p-2 disabled:text-gray-300"
						title={t("next_lesson")}
						data-testid="nextLessonButton"
					>
						<ChevronDoubleRightIcon className="h-5" />
					</button>
				</span>
			</span>
		</div>
	);
}
