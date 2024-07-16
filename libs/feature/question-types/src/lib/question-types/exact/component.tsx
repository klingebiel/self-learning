import { LabeledField } from "@self-learning/ui/forms";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { useTranslation } from "react-i18next";

export default function ExactAnswer() {
	const { question, answer, setAnswer, evaluation } = useQuestion("exact");
	const { t } = useTranslation();

	return (
		<>
			<LabeledField label="Antwort">
				<input
					value={answer.value ?? ""}
					onChange={e =>
						setAnswer({
							questionId: question.questionId,
							type: question.type,
							value: e.target.value
						})
					}
					disabled={!!evaluation}
					className="textfield"
					type="text"
				/>
			</LabeledField>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<div className="flex flex-col gap-2">
						<span>{t("accepted_answers")}:</span>

						<ul className="list-inside list-disc">
							{question.acceptedAnswers.map(ans => (
								<li key={ans.acceptedAnswerId}>{ans.value}</li>
							))}
						</ul>
					</div>
				</Feedback>
			)}
		</>
	);
}
