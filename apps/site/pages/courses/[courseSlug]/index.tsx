import { PlayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { useCourseCompletion } from "@self-learning/completion";
import { database } from "@self-learning/database";
import { useEnrollmentMutations, useEnrollments } from "@self-learning/enrollment";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	CourseContent,
	Defined,
	extractLessonIds,
	LessonInfo,
	ResolvedValue
} from "@self-learning/types";
import { AuthorsList } from "@self-learning/ui/common";
import * as ToC from "@self-learning/ui/course";
import { CenteredContainer, CenteredSection, useAuthentication } from "@self-learning/ui/layouts";
import { formatDateAgo, formatSeconds } from "@self-learning/util/common";
import { GetServerSideProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

type Course = ResolvedValue<typeof getCourse>;

function mapToTocContent(
	content: CourseContent,
	lessonIdMap: Map<string, LessonInfo>
): ToC.Content {
	let lessonNr = 1;

	return content.map(chapter => ({
		title: chapter.title,
		description: chapter.description,
		content: chapter.content.map(({ lessonId }) => {
			const lesson: ToC.Content[0]["content"][0] = lessonIdMap.has(lessonId)
				? {
						...(lessonIdMap.get(lessonId) as LessonInfo),
						lessonNr: lessonNr++
					}
				: {
						lessonId: "removed",
						slug: "removed",
						meta: { hasQuiz: false, mediaTypes: {} },
						title: "Removed",
						lessonType: LessonType.TRADITIONAL,
						lessonNr: -1
					};

			return lesson;
		})
	}));
}

async function mapCourseContent(content: CourseContent): Promise<ToC.Content> {
	const lessonIds = extractLessonIds(content);

	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: {
			lessonId: true,
			slug: true,
			title: true,
			meta: true
		}
	});

	const map = new Map<string, LessonInfo>();

	for (const lesson of lessons) {
		map.set(lesson.lessonId, lesson as LessonInfo);
	}

	return mapToTocContent(content, map);
}

type Summary = {
	/** Total number of lessons in this course. */
	lessons: number;
	/** Total number of chapters in this course. Includes subchapters (tbd). */
	chapters: number;
	/** Duration in seconds of video material. */
	duration: number;
};

function createCourseSummary(content: ToC.Content): Summary {
	const chapters = content.length;
	let lessons = 0;
	let duration = 0;

	for (const chapter of content) {
		for (const lesson of chapter.content) {
			lessons++;
			duration +=
				lesson.meta.mediaTypes.video?.duration ??
				lesson.meta.mediaTypes.article?.estimatedDuration ??
				0;
		}
	}

	return { lessons, chapters, duration };
}

type CourseProps = {
	course: Course;
	summary: Summary;
	content: ToC.Content;
	markdownDescription: CompiledMarkdown | null;
};

export const getServerSideProps: GetServerSideProps<CourseProps> = async ({ params, locale }) => {
	const courseSlug = params?.courseSlug as string | undefined;
	if (!courseSlug) {
		throw new Error("No slug provided.");
	}

	const course = await getCourse(courseSlug);
	if (!course) {
		return { notFound: true };
	}

	const content = await mapCourseContent(course.content as CourseContent);
	let markdownDescription = null;

	if (course.description && course.description.length > 0) {
		markdownDescription = await compileMarkdown(course.description);
		course.description = null;
	}

	const summary = createCourseSummary(content);

	return {
		props: {
			...(await serverSideTranslations(locale ?? "en", ["common"])),
			course: JSON.parse(JSON.stringify(course)) as Defined<typeof course>,
			summary,
			content,
			markdownDescription
		},
		notFound: !course
	};
};

async function getCourse(courseSlug: string) {
	return database.course.findUnique({
		where: { slug: courseSlug },
		include: {
			authors: {
				select: {
					slug: true,
					displayName: true,
					imgUrl: true
				}
			}
		}
	});
}

export default function Course({ course, summary, content, markdownDescription }: CourseProps) {
	return (
		<div className="bg-gray-50 pb-32">
			<CenteredSection className="bg-gray-50">
				<CourseHeader course={course} content={content} summary={summary} />
			</CenteredSection>

			{markdownDescription && (
				<section className="bg-white py-16">
					<CenteredContainer>
						<Description content={markdownDescription} />
					</CenteredContainer>
				</section>
			)}

			<CenteredSection className="bg-gray-50">
				<TableOfContents content={content} course={course} />
			</CenteredSection>
		</div>
	);
}

function CourseHeader({
	course,
	summary,
	content
}: {
	course: CourseProps["course"];
	summary: CourseProps["summary"];
	content: CourseProps["content"];
}) {
	const { withAuth, isAuthenticated } = useAuthentication();

	const enrollments = useEnrollments();
	const { enroll } = useEnrollmentMutations();
	const completion = useCourseCompletion(course.slug);

	const isEnrolled = useMemo(() => {
		if (!enrollments) return false;
		return !!enrollments.find(e => e.course.slug === course.slug);
	}, [enrollments, course]);

	const nextLessonSlug: string | null = useMemo(() => {
		if (!completion) return null;

		for (const chapter of content) {
			for (const lesson of chapter.content) {
				if (!completion.completedLessons[lesson.lessonId]) {
					return lesson.slug;
				}
			}
		}

		return null;
	}, [completion, content]);

	const firstLessonFromChapter = content[0].content[0];
	const lessonCompletionCount = completion?.courseCompletion.completedLessonCount ?? 0;
	return (
		<section className="flex flex-col gap-16">
			<div className="flex flex-wrap-reverse gap-12 md:flex-nowrap">
				<div className="flex flex-col justify-between gap-12">
					<div className="flex min-w-[50%] flex-col-reverse gap-12 md:flex-col">
						<div>
							<h1 className="mb-12 text-4xl md:text-6xl">{course.title}</h1>
							{course.subtitle && (
								<div className="text-lg tracking-tight text-light">
									{course.subtitle}
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<AuthorsList authors={course.authors} />
						<CreatedUpdatedDates
							createdAt={formatDateAgo(course.createdAt)}
							updatedAt={formatDateAgo(course.updatedAt)}
						/>
					</div>
				</div>

				<div className="flex w-full flex-col gap-4 rounded-lg">
					<div className="relative h-64 w-full shrink-0 grow">
						{course.imgUrl && (
							<Image
								priority
								className="shrink-0 rounded-lg bg-white object-cover"
								src={course.imgUrl}
								fill={true}
								sizes="600px"
								alt=""
							></Image>
						)}

						<ul className="absolute bottom-0 grid w-full grid-cols-3 divide-x divide-secondary rounded-b-lg border border-light-border border-t-transparent bg-white bg-opacity-80 p-2 text-center">
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Lerneinheiten</span>
								<span className="text-light">{summary.lessons}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Kapitel</span>
								<span className="text-light">{summary.chapters}</span>
							</li>
							<li className="flex flex-col">
								<span className="font-semibold text-secondary">Dauer</span>
								<span className="text-light">
									{formatSeconds(summary.duration)}
								</span>
							</li>
						</ul>
					</div>

					{isEnrolled && (
						<Link
							href={`/courses/${course.slug}/${
								nextLessonSlug ?? firstLessonFromChapter.slug
							}`}
							className="btn-primary"
						>
							<span>
								{nextLessonSlug
									? lessonCompletionCount === 0
										? "Starten"
										: "Fortfahren"
									: "Öffnen"}
							</span>
							<PlayIcon className="h-5" />
						</Link>
					)}

					{!isEnrolled && (
						<button
							className="btn-primary disabled:opacity-50"
							onClick={() => {
								withAuth(() => {
									enroll({ courseId: course.courseId });
								});
							}}
						>
							{isAuthenticated && (
								<>
									<span>Zum Lernplan hinzufügen</span>
									<PlusCircleIcon className="h-5" />
								</>
							)}
							{!isAuthenticated && <span>Lernplan nach Login verfügbar</span>}
						</button>
					)}
				</div>
			</div>
		</section>
	);
}

function TableOfContents({ content, course }: { content: ToC.Content; course: Course }) {
	const completion = useCourseCompletion(course.slug);

	return (
		<section className="flex flex-col gap-8">
			<h2 className="mb-4 text-4xl">Inhalt</h2>
			<ul className="flex flex-col gap-16">
				{content.map((chapter, index) => (
					<li key={index} className="flex flex-col rounded-lg bg-gray-100 p-8">
						<h3 className="heading flex gap-4 text-2xl">
							<span>{index + 1}.</span>
							<span className="text-secondary">{chapter.title}</span>
						</h3>
						<span className="mt-4 text-light">{chapter.description}</span>

						<ul className="mt-8 flex flex-col gap-1">
							{chapter.content.map(lesson => (
								<Lesson
									key={lesson.lessonId}
									href={`/courses/${course.slug}/${lesson.slug}`}
									lesson={lesson}
									isCompleted={!!completion?.completedLessons[lesson.lessonId]}
								/>
							))}
						</ul>
					</li>
				))}
			</ul>
		</section>
	);
}

function Lesson({
	lesson,
	href,
	isCompleted
}: {
	lesson: ToC.Content[0]["content"][0];
	href: string;
	isCompleted: boolean;
}) {
	const { isAuthenticated } = useAuthentication();

	if (!isAuthenticated) {
		return (
			<div className="flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm border-gray-300">
				<LessonEntry lesson={lesson} />
			</div>
		);
	}

	return (
		<Link
			href={href}
			className={`flex gap-2 rounded-r-lg border-l-4 bg-white px-4 py-2 text-sm ${
				isCompleted ? "border-emerald-500" : "border-gray-300"
			}`}
		>
			<LessonEntry lesson={lesson} />
		</Link>
	);
}

function LessonEntry({ lesson }: { lesson: ToC.Content[0]["content"][0] }) {
	return (
		<span className="flex">
			<span className="w-8 shrink-0 self-center font-medium text-secondary">
				{lesson.lessonNr}
			</span>
			<span>{lesson.title}</span>
		</span>
	);
}

function CreatedUpdatedDates({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
	return (
		<div className="flex flex-wrap gap-2 text-xs text-light">
			<span>
				Erstellt: <span>{createdAt}</span>
			</span>
			<span>|</span>
			<span>
				Letzte Änderung: <span>{updatedAt}</span>
			</span>
		</div>
	);
}

function Description({ content }: { content: CompiledMarkdown }) {
	return (
		<div className="prose prose-emerald max-w-full">
			<MDXRemote {...content}></MDXRemote>
		</div>
	);
}
