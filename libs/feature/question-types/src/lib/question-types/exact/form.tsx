import { PlusIcon } from "@heroicons/react/24/solid";
import { getRandomId } from "@self-learning/util/common";
import { useFieldArray, useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { ExactQuestion } from "./schema";
import { AddButton, DeleteButton } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";

export default function ExactForm({
	index
}: {
	question: { type: ExactQuestion["type"] };
	index: number;
}) {
	const { t } = useTranslation();
	const { control, register } = useFormContext<QuestionTypeForm<ExactQuestion>>();
	const {
		fields: acceptedAnswers,
		append,
		remove
	} = useFieldArray({
		control,
		name: `quiz.questions.${index}.acceptedAnswers`
	});

	function addAnswer() {
		append({
			acceptedAnswerId: getRandomId(),
			value: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		remove(answerIndex);
	}

	return (
		<section className="flex flex-col gap-8">
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-4">
					<h5 className="text-2xl font-semibold tracking-tight">
						{t("accepted_answers")}
					</h5>

					<AddButton
						onAdd={addAnswer}
						title={t("add_answer")}
						additionalClassNames={" h-fit w-fit items-center"}
						label={<span>{t("add_answer")}</span>}
					/>
				</div>

				<span className="flex items-center gap-4">
					<input
						type="checkbox"
						className="checkbox"
						id="caseSensitive"
						{...register(`quiz.questions.${index}.caseSensitive`)}
					/>
					<label className="select-none text-sm" htmlFor="caseSensitive">
						{t("care_for_caps")}
					</label>
				</span>
			</div>

			{acceptedAnswers.length > 0 && (
				<div className="flex flex-col gap-4">
					{acceptedAnswers.map((acceptedAnswer, acceptedAnswerIndex) => (
						<div className="flex gap-4" key={acceptedAnswer.acceptedAnswerId}>
							<input
								type="text"
								className="textfield w-64"
								{...register(
									`quiz.questions.${index}.acceptedAnswers.${acceptedAnswerIndex}.value`
								)}
								placeholder={t("answer")}
								autoComplete="off"
							/>

							<DeleteButton
								onDelete={() => removeAnswer(acceptedAnswerIndex)}
								title={t("delete_answer")}
							/>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
