import { DialogWithReactNodeTitle, CollapsibleBox } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { IncompleteNanoModuleExport, MissedElement } from "@self-learning/lia-exporter";
import Link from "next/link";
import { CourseFormModel } from "../course-form-model";
import { useTranslation } from "react-i18next";

/**
 * Generates a Link to the quiz with the given index in a uniform format.
 * @param courseUrlPath The URL of the exported course (used as prefix to generate links)
 * @param quizIndex The index of the quiz within all quizzes of the course (0-based)
 * @param questionType The type of the question (e.g. "Programmieraufgabe", "Lückentext")
 * @returns a Link component that opens the quiz in a new window.
 */
function QuestionLink({
	courseUrlPath,
	quizIndex,
	questionType
}: {
	courseUrlPath: string;
	quizIndex: number;
	questionType: string;
}) {
	return (
		<Link
			className="text-secondary"
			href={`${courseUrlPath}/quiz?index=${quizIndex}`}
			target="_blank"
		>
			{questionType} {quizIndex + 1}
		</Link>
	);
}

/**
 * Generates a report per missed element in a nanomodule export.
 * If possible this will create links for incomplete exported elements to
 * simplify a possible review.
 * @param courseUrlPath The URL of the exported course (used as prefix to generate links)
 * @param missedItem The missed element of the report
 * @returns A React component to display the report
 */
function ErrorMessageForReportItem({
	courseUrlPath,
	missedItem
}: {
	courseUrlPath: string;
	missedItem: MissedElement;
}) {
	const { t } = useTranslation();
	switch (missedItem.type) {
		case "programming":
			if (missedItem.cause === "unsupportedLanguage") {
				return (
					<>
						<QuestionLink
							courseUrlPath={courseUrlPath}
							quizIndex={missedItem.index}
							questionType={t("programming_task")}
						/>{" "}
						{t("unsupported_language_text_1")}{" "}
						<span className="font-mono">{missedItem.language}</span>{" "}
						{t("unsupported_language_text_2")}
					</>
				);
			}
			break;
		case "programmingUnspecific":
			if (missedItem.cause === "unsupportedSolution") {
				return <>{t("unsupported_solution_text_1")}</>;
			} else if (missedItem.cause === "hintsUnsupported") {
				return <>{t("unsupported_hints_text")}</>;
			}
			break;
		case "clozeText":
			if (missedItem.cause === "unsupportedAnswerType") {
				return (
					<>
						{t("unsupported_answer_text_1")}{" "}
						<QuestionLink
							courseUrlPath={courseUrlPath}
							quizIndex={missedItem.index}
							questionType="Lückentext"
						/>{" "}
						{t("unsupported_answer_text_2")}
					</>
				);
			}
			break;
		case "unknownQuestionType":
			return (
				<>
					<QuestionLink
						courseUrlPath={courseUrlPath}
						quizIndex={missedItem.index}
						questionType={t("question")}
					/>{" "}
					{t("unknown_question_type_text_1")}{" "}
					<span className="font-mono">{missedItem.questionType}</span>{" "}
					{t("unknown_question_type_text_2")}
				</>
			);
		case "article": {
			const element =
				missedItem.cause.length > 1
					? t("following_unsupported_items")
					: t("following_unsupported_item");
			return (
				<>
					{t("unsupported_article")}
					{element}: {missedItem.cause.join(", ")}'
				</>
			);
		}
	}
	return <>{t("unknown_error")}</>;
}

/**
 * Creates a section title for a incomplete nanomodule export
 * @param slug The slug referring (link) to the course
 * @param item The report of the incomplete nanomodule export
 * @returns A section title including a link to visit the nanomodule, which can be used as title for a collapsible box
 */
function SectionTitle({ slug, item }: { slug: string; item: IncompleteNanoModuleExport }) {
	const { t } = useTranslation();
	return (
		<div className="flex">
			<Link href={`/courses/${slug}/${item.nanomodule.slug}`} target="_blank">
				<div className="text-lg text-secondary">{item.nanomodule.name}</div>
			</Link>
			<p className="ml-2 text-lg font-normal">
				{`(${item.missedElements.length} ${t("incomplete_elements")})`}{" "}
			</p>
		</div>
	);
}
/**
 * Generates a dialog to display a report of incomplete nanomodule exports.
 * @param report The report of incomplete nanomodule exports (should not be empty)
 * @param course The course which was exported
 * @param onClose The callback to close the dialog (allows closing the dialog by clicking on the backdrop)
 * @returns The dialog to display the report (component)
 */
export function ErrorReportDialog({
	report,
	course,
	onClose
}: {
	report: IncompleteNanoModuleExport[];
	course: CourseFormModel;
	onClose: () => void;
}) {
	const { t } = useTranslation();
	const element = report.length > 1 ? t("some_elements") : t("one_element");

	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "80vh", width: "80vw", overflow: "auto" }}
				title={`${course.title} ${t("successfully_exported")}`}
				onClose={onClose}
			>
				<div className="mt-[-1rem] mb-4">{`${element} ${t("lia_script_unsupported")}`}</div>
				<div className="scroll flex-grow overflow-auto">
					{report.map(item => (
						<div className="mb-2">
							<CollapsibleBox title={<SectionTitle slug={course.slug} item={item} />}>
								<ul className="ml-4 list-disc space-y-1">
									{item.missedElements.map(missed => (
										<li>
											<ErrorMessageForReportItem
												missedItem={missed}
												courseUrlPath={`/courses/${course.slug}/${item.nanomodule.slug}`}
											/>
										</li>
									))}
								</ul>
							</CollapsibleBox>
						</div>
					))}
				</div>
				<div className="mt-2 grid justify-items-end">
					<button
						className="btn-primary"
						type="button"
						onClick={() => {
							onClose();
						}}
					>
						{t("close")}
					</button>
				</div>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
