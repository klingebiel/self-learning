import { useQuiz } from "@self-learning/quiz";
import { motion } from "framer-motion";
import { useQuestion } from "./use-question-hook";
import { useTranslation } from "react-i18next";

/**
 * Component that displays feedback to a user after answering a question.
 * Children can be used to provide additional information, such as the intended solution.
 * Should only be rendered  if there is an evaluation for the current question.
 *
 * @example
 * {evaluation && (
 *		<Feedback isCorrect={evaluation.isCorrect}>
 *			{!config.showSolution && !evaluation.isCorrect && (
 *				<div className="flex flex-col gap-2">
 *					<span>Akzeptierte Antworten:</span
 *					<ul className="list-inside list-disc">
 *						{question.acceptedAnswers.map(ans => (
 *							<li key={ans.acceptedAnswerId}>{ans.value}</li>
 *						))}
 *					</ul>
 *				</div>
 *			)}
 *		</Feedback>
 *)}
 */
export function Feedback({
	isCorrect,
	children
}: {
	isCorrect: boolean;
	/** The `children` can render additional feedback. They are only displayed if the answer was wrong and quiz has `showSolutions` enabled. */
	children?: React.ReactNode;
}) {
	const { config } = useQuiz();
	const { evaluation } = useQuestion("text"); // question type is irrelevant here
	const { t } = useTranslation();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: "tween", duration: 0.5 }}
			className={`flex flex-col gap-2 rounded-lg border p-4 ${
				isCorrect
					? "border-green-500 bg-green-100 text-green-500"
					: " border-red-500 bg-red-100 text-red-500"
			}`}
		>
			{isCorrect ? (
				<span className="font-medium">{t("answer_is_correct")}</span>
			) : (
				<div className="flex flex-col gap-2">
					<span className="font-medium">{t("answer_is_not_correct")}.</span>
				</div>
			)}
			{evaluation && !evaluation.isCorrect && config.showSolution && children}
		</motion.div>
	);
}
