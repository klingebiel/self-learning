import { TextArea } from "@self-learning/ui/forms";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { useTranslation } from "react-i18next";

export default function TextAnswer() {
	const { setAnswer, answer, evaluation } = useQuestion("text");
	const { t } = useTranslation();

	return (
		<>
			<TextArea
				rows={12}
				label="Antwort"
				value={answer.value}
				disabled={!!evaluation}
				onChange={e =>
					setAnswer({
						type: "text",
						value: e.target.value
					})
				}
			/>
			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<p className="text-sm">{t("free_text_info")}</p>
				</Feedback>
			)}
		</>
	);
}
