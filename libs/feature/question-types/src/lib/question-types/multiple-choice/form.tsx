import { PlusIcon } from "@heroicons/react/24/solid";
import { MarkdownField } from "@self-learning/ui/forms";
import { getRandomId } from "@self-learning/util/common";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { MultipleChoiceQuestion } from "./schema";
import { AddButton, DeleteButton } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";

export default function MultipleChoiceForm({
	index
}: {
	question: { type: MultipleChoiceQuestion["type"] };
	index: number;
}) {
	const { t } = useTranslation();
	const { control, register } = useFormContext<QuestionTypeForm<MultipleChoiceQuestion>>();
	const { append, replace } = useFieldArray({
		control,
		name: `quiz.questions.${index}.answers`
	});

	/** Unlike `fields` (from useFieldArray), this will always be rendered with latest data. */
	const answers = useWatch({
		name: `quiz.questions.${index}.answers`,
		control
	}) as MultipleChoiceQuestion["answers"];

	function addAnswer() {
		append({
			answerId: getRandomId(),
			isCorrect: false,
			content: ""
		});
	}

	function removeAnswer(answerIndex: number) {
		if (window.confirm(t("confirm_delete_answer"))) {
			replace(answers.filter((_, i) => i !== answerIndex));
		}
	}

	return (
		<section className="flex flex-col gap-8">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">{t("answers")}</h5>

				<AddButton
					onAdd={addAnswer}
					title={t("add_answer")}
					label={<span>{t("add_answer")}</span>}
				/>
			</div>

			{answers.map((answer, answerIndex) => (
				<div
					key={answer.answerId}
					className={`relative flex flex-col gap-2 rounded-lg border border-light-border p-4 ${
						answers?.[answerIndex]?.isCorrect
							? "border-secondary bg-emerald-50"
							: "border-red-500 bg-red-50"
					}`}
				>
					<div className="flex justify-between">
						<label className="flex w-fit select-none items-center gap-2">
							<input
								type="checkbox"
								className="checkbox"
								{...register(
									`quiz.questions.${index}.answers.${answerIndex}.isCorrect`
								)}
							/>
							{t("answer_is_correct")}
						</label>

						<DeleteButton
							onDelete={() => removeAnswer(answerIndex)}
							title={t("delete_answer")}
						/>
					</div>

					<Controller
						control={control}
						name={`quiz.questions.${index}.answers.${answerIndex}.content`}
						render={({ field }) => (
							<MarkdownField content={field.value} setValue={field.onChange} />
						)}
					></Controller>
				</div>
			))}
		</section>
	);
}
