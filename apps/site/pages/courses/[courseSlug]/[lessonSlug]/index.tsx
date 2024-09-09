import { CheckCircleIcon, PlayIcon } from "@heroicons/react/24/solid";
import { LessonType } from "@prisma/client";
import { trpc } from "@self-learning/api-client";
import { useCourseCompletion, useMarkAsCompleted } from "@self-learning/completion";
import {
	getStaticPropsForLayout,
	LessonLayout,
	LessonLayoutProps,
	useLessonContext
} from "@self-learning/lesson";
import { CompiledMarkdown, compileMarkdown } from "@self-learning/markdown";
import {
	findContentType,
	getContentTypeDisplayName,
	includesMediaType,
	LessonContent,
	LessonMeta
} from "@self-learning/types";
import { AuthorsList, LicenseChip, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { MarkdownContainer } from "@self-learning/ui/layouts";
import { PdfViewer, VideoPlayer } from "@self-learning/ui/lesson";
import { GetServerSideProps } from "next";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type LessonProps = LessonLayoutProps & {
	markdown: {
		description: CompiledMarkdown | null;
		article: CompiledMarkdown | null;
		preQuestion: CompiledMarkdown | null;
		subtitle: CompiledMarkdown | null;
	};
	isPreview?: boolean;
};

export const getServerSideProps: GetServerSideProps<LessonProps> = async ({ params }) => {
	const props = await getStaticPropsForLayout(params);

	if ("notFound" in props) return { notFound: true };

	const { lesson } = props;

	lesson.quiz = null; // Not needed on this page, but on /quiz
	let mdDescription = null;
	let mdArticle = null;
	let mdQuestion = null;
	let mdSubtitle = null;

	if (lesson.description) {
		mdDescription = await compileMarkdown(lesson.description);
	}

	if (lesson.subtitle && lesson.subtitle.length > 0) {
		mdSubtitle = await compileMarkdown(lesson.subtitle);
	}

	const { content: article } = findContentType("article", lesson.content as LessonContent);

	if (article) {
		mdArticle = await compileMarkdown(article.value.content ?? "Kein Inhalt.");

		// Remove article content to avoid duplication
		article.value.content = "(replaced)";
	}

	// TODO change to check if the lesson is self requlated
	if (lesson.lessonType === LessonType.SELF_REGULATED) {
		mdQuestion = await compileMarkdown(lesson.selfRegulatedQuestion ?? "Kein Inhalt.");
	}

	return {
		props: {
			...props,
			markdown: {
				article: mdArticle,
				description: mdDescription,
				preQuestion: mdQuestion,
				subtitle: mdSubtitle
			}
		}
	};
};

function usePreferredMediaType(lesson: LessonProps["lesson"]) {
	// Handle situations that content creator may created an empty lesson (to add content later)
	const content = lesson.content as LessonContent;
	const router = useRouter();
	const [preferredMediaType, setPreferredMediaType] = useState(
		content.length > 0 ? content[0].type : null
	);

	useEffect(() => {
		if (content.length > 0) {
			const availableMediaTypes = content.map(c => c.type);

			const { type: typeFromRoute } = router.query;
			let typeFromStorage: string | null = null;

			if (typeof window !== "undefined") {
				typeFromStorage = window.localStorage.getItem("preferredMediaType");
			}

			const { isIncluded, type } = includesMediaType(
				availableMediaTypes,
				(typeFromRoute as string) ?? typeFromStorage
			);

			if (isIncluded) {
				setPreferredMediaType(type);
			}
		}
	}, [content, router.query]);

	return preferredMediaType;
}

export default function Lesson({ lesson, course, markdown, isPreview }: LessonProps) {
	const [showDialog, setShowDialog] = useState(lesson.lessonType === LessonType.SELF_REGULATED);

	const { content: video } = findContentType("video", lesson.content as LessonContent);
	const { content: pdf } = findContentType("pdf", lesson.content as LessonContent);

	const preferredMediaType = usePreferredMediaType(lesson);

	if (showDialog && markdown.preQuestion) {
		return (
			<article className="flex flex-col gap-4">
				<SelfRegulatedPreQuestion
					setShowDialog={setShowDialog}
					question={markdown.preQuestion}
				/>
			</article>
		);
	}

	return (
		<article className="flex flex-col gap-4">
			{preferredMediaType === "video" && (
				<div className="aspect-video w-full xl:max-h-[75vh]">
					{video?.value.url ? (
						<VideoPlayer url={video.value.url} />
					) : (
						<div className="py-16 text-center text-red-500">Error: Missing URL</div>
					)}
				</div>
			)}

			<LessonHeader
				lesson={lesson}
				course={course}
				mdDescription={markdown.description}
				mdSubtitle={markdown.subtitle}
				isPreview={isPreview}
			/>

			{preferredMediaType === "article" && markdown.article && (
				<MarkdownContainer className="mx-auto w-full pt-4">
					<MDXRemote {...markdown.article} />
				</MarkdownContainer>
			)}

			{preferredMediaType === "pdf" && pdf?.value.url && (
				<div className="h-[90vh] xl:h-[80vh]">
					<PdfViewer url={pdf.value.url} />
				</div>
			)}
		</article>
	);
}

Lesson.getLayout = LessonLayout;

function LessonHeader({
	course,
	lesson,
	mdDescription,
	mdSubtitle,
	isPreview
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	mdDescription?: CompiledMarkdown | null;
	mdSubtitle?: CompiledMarkdown | null;
	isPreview?: boolean;
}) {
	const { chapterName } = useLessonContext(lesson.lessonId, course.slug);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="flex w-full flex-col">
					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-2">
							<span className="font-semibold text-secondary">{chapterName}</span>
							<h1 className="text-4xl">{lesson.title}</h1>
						</span>
						<LessonControls course={course} lesson={lesson} isPreview={isPreview} />
					</span>
					{mdSubtitle && (
						<MarkdownContainer className="mt-2 text-light">
							<MDXRemote {...mdSubtitle} />
						</MarkdownContainer>
					)}

					<span className="flex flex-wrap-reverse justify-between gap-4">
						<span className="flex flex-col gap-3">
							<Authors authors={lesson.authors} />
						</span>
						<div className="-mt-3">
							{!lesson.license ? (
								<DefaultLicenseLabel />
							) : (
								<LicenseLabel license={lesson.license} />
							)}
						</div>
					</span>

					<div className="pt-4">
						<MediaTypeSelector lesson={lesson} course={course} isPreview={isPreview} />
					</div>
				</div>
			</div>

			{mdDescription && (
				<MarkdownContainer className="mx-auto pb-4">
					<MDXRemote {...mdDescription} />
				</MarkdownContainer>
			)}
		</div>
	);
}

function DefaultLicenseLabel() {
	const { data, isLoading } = trpc.licenseRouter.getDefault.useQuery();
	const fallbackLicense = {
		name: "Keine Lizenz verfügbar",
		logoUrl: "",
		url: "",
		oerCompatible: false,
		licenseText:
			"*Für diese Lektion ist keine Lizenz verfügbar. Bei Nachfragen, wenden Sie sich an den Autor*"
	};
	if (!isLoading && !data) {
		console.log("No default license found");
	}
	if (isLoading) return null;
	return <LicenseLabel license={data ?? fallbackLicense} />;
}

function LicenseLabel({ license }: { license: NonNullable<LessonProps["lesson"]["license"]> }) {
	return (
		<LabeledField label="Lizenz">
			<LicenseChip
				name={license.name}
				imgUrl={license.logoUrl ?? undefined}
				description={license.licenseText ?? undefined}
				url={license.url ?? undefined}
			/>
		</LabeledField>
	);
}

function LessonControls({
	course,
	lesson,
	isPreview
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	isPreview?: boolean;
}) {
	const markAsCompleted = useMarkAsCompleted(lesson.lessonId, course.slug);
	const completion = useCourseCompletion(course.slug);
	const isCompletedLesson = !!completion?.completedLessons[lesson.lessonId];
	const hasQuiz = (lesson.meta as LessonMeta).hasQuiz;

	const router = useRouter();
	const { courseId } = router.query;

	let path = `/courses/${course.slug}/${lesson.slug}/quiz`;
	if (isPreview) {
		const courseIdPart = courseId ? courseId : "placeholder";
		const lessonIdPart = lesson.lessonId ? lesson.lessonId : "placeholder";
		path = `/teaching/preview/${courseIdPart}/${lessonIdPart}/quiz?title=${lesson.title}`;
	}

	return (
		<div className="flex w-full flex-wrap gap-2 xl:w-fit xl:flex-row">
			{hasQuiz && (
				<Link
					href={path}
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					data-testid="quizLink"
				>
					<span>Zur Lernkontrolle</span>
					<PlayIcon className="h-6 shrink-0" />
				</Link>
			)}

			{!hasQuiz && !isCompletedLesson && (
				<button
					className="btn-primary flex h-fit w-full flex-wrap-reverse text-sm xl:w-fit"
					onClick={markAsCompleted}
				>
					<span>Als abgeschlossen markieren</span>
					<CheckCircleIcon className="h-6 shrink-0" />
				</button>
			)}
		</div>
	);
}

function Authors({ authors }: { authors: LessonProps["lesson"]["authors"] }) {
	return (
		<>
			{authors.length > 0 && (
				<div className="mt-4">
					<AuthorsList authors={authors} />
				</div>
			)}
		</>
	);
}

function MediaTypeSelector({
	lesson,
	course,
	isPreview
}: {
	course: LessonProps["course"];
	lesson: LessonProps["lesson"];
	isPreview?: boolean;
}) {
	const lessonContent = lesson.content as LessonContent;
	// If no content is specified at this time, use video as default (and don't s´display anything)
	const preferredMediaType = usePreferredMediaType(lesson) ?? "video";
	const { index } = findContentType(preferredMediaType, lessonContent);
	const [selectedIndex, setSelectedIndex] = useState(index);
	const router = useRouter();
	const { courseId } = router.query;

	function changeMediaType(index: number) {
		const type = lessonContent[index].type;

		window.localStorage.setItem("preferredMediaType", type);
		let path = `/courses/${course.slug}/${lesson.slug}?type=${type}`;

		if (isPreview) {
			path = `/teaching/preview/${courseId}/${lesson.slug}`;
		}
		router.push(path, undefined, {
			shallow: true
		});

		setSelectedIndex(index);
	}

	useEffect(() => {
		if (selectedIndex !== index) {
			setSelectedIndex(index);
		}
	}, [index, selectedIndex, setSelectedIndex]);

	return (
		<>
			{lessonContent.length > 1 && (
				<Tabs selectedIndex={selectedIndex} onChange={changeMediaType}>
					{lessonContent.map((content, idx) => (
						<Tab key={idx}>
							<span data-testid="mediaTypeTab">
								{getContentTypeDisplayName(content.type)}
							</span>
						</Tab>
					))}
				</Tabs>
			)}
		</>
	);
}

function SelfRegulatedPreQuestion({
	question,
	setShowDialog
}: {
	question: CompiledMarkdown;
	setShowDialog: Dispatch<SetStateAction<boolean>>;
}) {
	const [userAnswer, setUserAnswer] = useState("");

	return (
		<>
			<div>
				<h1>Aktivierungsfrage</h1>
				<MarkdownContainer className="w-full py-4">
					<MDXRemote {...question} />
				</MarkdownContainer>
				<div className="mt-8">
					<h2>Deine Antwort:</h2>
					<textarea
						className="w-full"
						placeholder="..."
						onChange={e => setUserAnswer(e.target.value)}
					/>
				</div>
				<div className="mt-2 flex justify-end gap-2">
					<button
						type="button"
						className="btn-primary"
						onClick={() => {
							setShowDialog(false);
						}}
						disabled={userAnswer.length == 0}
					>
						Antwort Speichern
					</button>
				</div>
			</div>
		</>
	);
}
