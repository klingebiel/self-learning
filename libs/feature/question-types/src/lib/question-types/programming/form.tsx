import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { ProgrammingQuestion } from "./schema";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function ProgrammingForm({
	question,
	index
}: {
	question: ProgrammingQuestion;
	index: number;
}) {
	const { control, watch, getValues } = useFormContext<QuestionTypeForm<ProgrammingQuestion>>();
	const { update } = useFieldArray({ control, name: "quiz.questions" });

	const selectedMode = watch(`quiz.questions.${index}.custom.mode`);
	const selectedLanguage = watch(`quiz.questions.${index}.language`);
	const { t } = useTranslation();

	function switchMode(mode: "standalone" | "callable") {
		const confirmed = window.confirm(t("confirm_switch_mode_text"));

		if (!confirmed) {
			return;
		}

		const currentValue = getValues(`quiz.questions.${index}`);
		console.log(currentValue);

		if (mode === "standalone") {
			update(index, {
				...currentValue,
				type: "programming",
				custom: {
					mode: "standalone",
					expectedOutput: "",
					solutionTemplate: currentValue.custom.solutionTemplate
				}
			});
		}

		if (mode === "callable") {
			update(index, {
				...currentValue,
				type: "programming",
				custom: {
					mode: "callable",
					mainFile: "",
					solutionTemplate: currentValue.custom.solutionTemplate
				}
			});
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<Explainer />
			<span className="flex flex-wrap gap-4">
				<div>
					<LabeledField label={t("mode")}>
						<select
							value={selectedMode}
							onChange={v => switchMode(v.target.value as "standalone" | "callable")}
							className="textfield w-64 rounded-lg px-8"
						>
							<option value="standalone">standalone</option>
							<option value="callable">callable</option>
						</select>
					</LabeledField>
				</div>

				<div>
					<LabeledField label={t("programming_lang")}>
						<Controller
							control={control}
							name={`quiz.questions.${index}.language`}
							render={({ field }) => (
								<select
									value={field.value}
									onChange={field.onChange}
									className="textfield w-64 rounded-lg px-8"
								>
									<option value="java">Java</option>
									<option value="python">Python</option>
									<option value="typescript">TypeScript</option>
									<option value="javascript">JavaScript</option>
								</select>
							)}
						></Controller>
					</LabeledField>
				</div>
			</span>
			<section className="grid grid-cols-2 gap-4">
				{selectedMode === "standalone" && (
					<>
						<LabeledField label="Template">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.solutionTemplate`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>

						<LabeledField label={t("expected_output")}>
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.expectedOutput`}
								render={({ field }) => (
									<EditorField value={field.value} onChange={field.onChange} />
								)}
							></Controller>
						</LabeledField>
					</>
				)}

				{selectedMode === "callable" && (
					<>
						<LabeledField label="Template (Solution.<extension>)">
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.solutionTemplate`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>

						<LabeledField label={t("executing_program")}>
							<Controller
								control={control}
								name={`quiz.questions.${index}.custom.mainFile`}
								render={({ field }) => (
									<EditorField
										key={selectedLanguage} // re-create editor when language changes to apply correct syntax highlighting
										language={selectedLanguage}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							></Controller>
						</LabeledField>
					</>
				)}
			</section>
		</div>
	);
}

function Explainer() {
	const { t } = useTranslation();
	return (
		<div className="flex flex-col gap-4">
			<p className="text-sm text-light">{t("explainer_text_1")}</p>

			<ul className="text-sm text-light">
				<li>
					<span className="font-bold">standlone</span>: {t("explainer_text_2")}
				</li>
				<li>
					<span className="font-bold">callable</span>: {t("explainer_text_3")}
				</li>
			</ul>
		</div>
	);
}
