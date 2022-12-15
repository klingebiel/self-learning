import { motion } from "framer-motion";

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
	children?: React.ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ type: "tween", duration: 0.5 }}
			className={`flex flex-col gap-2 rounded-lg border p-4 text-white ${
				isCorrect
					? "border-green-500 bg-green-100 text-green-500"
					: " border-red-500 bg-red-100 text-red-500"
			}`}
		>
			{isCorrect ? (
				<span className="font-medium">Deine Antwort ist richtig!</span>
			) : (
				<div className="flex flex-col gap-2">
					<span className="font-medium">Deine Antwort ist leider nicht korrekt.</span>
				</div>
			)}
			{children}
		</motion.div>
	);
}