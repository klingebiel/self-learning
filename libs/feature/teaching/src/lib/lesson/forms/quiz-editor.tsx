import {
	INITIAL_QUESTION_CONFIGURATION_FUNCTIONS,
	QUESTION_TYPE_DISPLAY_NAMES,
	QuestionFormRenderer,
	QuestionType
} from "@self-learning/question-types";
import { Quiz } from "@self-learning/quiz";
import {
	AddButton,
	AddDropDownButton,
	DeleteButton,
	Divider,
	RemovableTab,
	SectionHeader,
	Tabs
} from "@self-learning/ui/common";
import { LabeledField, MarkdownField } from "@self-learning/ui/forms";
import { getRandomId } from "@self-learning/util/common";
import { Reorder } from "framer-motion";
import { t } from "i18next";
import { useState } from "react";
import { Control, Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

type QuizForm = { quiz: Quiz };

export function useQuizEditorForm() {
	const { control, register, setValue } = useFormContext<QuizForm>();
	const {
		append,
		remove,
		fields: quiz,
		replace: setQuiz
	} = useFieldArray({
		control,
		name: "quiz.questions"
	});

	const [questionIndex, setQuestionIndex] = useState<number>(quiz.length > 0 ? 0 : -1);
	const currentQuestion = quiz[questionIndex];

	function appendQuestion(type: QuestionType["type"]) {
		setQuestionIndex(old => old + 1);

		const initialConfigFn = INITIAL_QUESTION_CONFIGURATION_FUNCTIONS[type];

		if (!initialConfigFn) {
			console.error("No initial configuration function found for question type", type);
			return;
		}

		append(initialConfigFn());
	}

	function removeQuestion(index: number) {
		const confirm = window.confirm(t("remove_task"));

		if (confirm) {
			remove(index);

			if (index === questionIndex) {
				setQuestionIndex(quiz.length - 2); // set to last index or -1 if no questions exist
			}
		}
	}

	return {
		control,
		quiz,
		register,
		setValue,
		setQuiz,
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		removeQuestion
	};
}

export function QuizEditor() {
	const { t } = useTranslation();
	const {
		control,
		quiz,
		setQuiz,
		questionIndex,
		setQuestionIndex,
		currentQuestion,
		appendQuestion,
		removeQuestion
	} = useQuizEditorForm();

	return (
		<section className="flex flex-col gap-8">
			<SectionHeader
				title={t("tasks")}
				subtitle={t("tasks_subtitle")}
				button={
					<AddDropDownButton label={t("add_task")}>
						{Object.keys(QUESTION_TYPE_DISPLAY_NAMES()).map(type => (
							<AddButton
								title={t("add_task")}
								onAdd={() => appendQuestion(type as QuestionType["type"])}
								size={"w-full"}
								key={type as QuestionType["type"]}
								label={
									<span>
										{
											QUESTION_TYPE_DISPLAY_NAMES()[
												type as QuestionType["type"]
											]
										}
									</span>
								}
							/>
						))}
					</AddDropDownButton>
				}
			/>

			<QuizConfigForm />

			{questionIndex >= 0 && (
				<Reorder.Group values={quiz} onReorder={setQuiz} axis="x" className="w-full">
					<Tabs selectedIndex={questionIndex} onChange={index => setQuestionIndex(index)}>
						{quiz.map((value, index) => (
							<Reorder.Item
								as="div"
								value={value}
								key={value.id}
								className="bg-gray-50"
							>
								<RemovableTab key={value.id} onRemove={() => removeQuestion(index)}>
									<div className="flex flex-col">
										<span className="text-xs font-normal">
											{QUESTION_TYPE_DISPLAY_NAMES()[value.type]}
										</span>
										<span>
											{t("task")} {index + 1}
										</span>
									</div>
								</RemovableTab>
							</Reorder.Item>
						))}
					</Tabs>
				</Reorder.Group>
			)}

			{currentQuestion && (
				<BaseQuestionForm
					key={currentQuestion.id}
					currentQuestion={currentQuestion}
					control={control}
					index={questionIndex}
				>
					<QuestionFormRenderer question={currentQuestion} index={questionIndex} />
				</BaseQuestionForm>
			)}
		</section>
	);
}

function QuizConfigForm() {
	const { control, register, setValue } = useQuizEditorForm();
	const { t } = useTranslation();

	const config = useWatch({
		control,
		name: "quiz.config"
	});

	function resetToDefault() {
		setValue("quiz.config", null);
	}

	function initCustomConfig() {
		setValue(
			"quiz.config",
			config
				? config
				: {
						hints: {
							enabled: false,
							maxHints: 0
						},
						maxErrors: 0,
						showSolution: false
				  }
		);
	}

	return (
		<div className="-mt-8 flex flex-col gap-4 rounded-lg bg-gray-200 p-4">
			<div className="flex flex-col gap-4">
				<span className="flex items-center gap-4">
					<input
						type="checkbox"
						className="checkbox"
						id="customConfig"
						checked={!config}
						onChange={e => (e.target.checked ? resetToDefault() : initCustomConfig())}
					/>
					<label htmlFor="customConfig" className="select-none text-sm">
						{t("default_configuration")}
					</label>
				</span>

				{!config ? (
					<ul className="list-inside list-disc text-sm text-light">
						<li>{t("all_questions_rights")}</li>
						<li>{t("solution_not_shown")}</li>
						<li>{t("unlimited_hints")}</li>
					</ul>
				) : (
					<div className="flex flex-col gap-4 text-sm">
						<span className="flex items-center gap-4">
							<input
								{...register("quiz.config.showSolution")}
								type="checkbox"
								id="showSolutions"
								className="checkbox"
							></input>
							<label htmlFor="showSolutions" className="select-none">
								{t("show_solution")}
							</label>
						</span>

						<span className="flex items-center gap-4">
							<input
								{...register("quiz.config.hints.enabled")}
								type="checkbox"
								id="hintsEnabled"
								className="checkbox"
							></input>
							<label htmlFor="hintsEnabled" className="select-none">
								{t("hints_enabled")}
							</label>
						</span>

						<LabeledField label={t("max_hints")}>
							<input
								{...register("quiz.config.hints.maxHints")}
								type={"number"}
								className="textfield w-fit"
								placeholder="z. B. 2"
							/>
						</LabeledField>

						<LabeledField label={t("max_wrong_answers")}>
							<input
								{...register("quiz.config.maxErrors")}
								type={"number"}
								className="textfield w-fit"
								defaultValue={0}
							/>
						</LabeledField>
					</div>
				)}
			</div>
		</div>
	);
}

function BaseQuestionForm({
	currentQuestion,
	index,
	control,
	children
}: {
	currentQuestion: QuestionType;
	index: number;
	control: Control<QuizForm, unknown>;
	children: React.ReactNode;
}) {
	const { t } = useTranslation();
	return (
		<div className="">
			<span className="font-semibold text-secondary">
				{QUESTION_TYPE_DISPLAY_NAMES()[currentQuestion.type]}
			</span>
			<h5 className="mb-4 mt-2 text-2xl font-semibold tracking-tight">
				{t("task")} {index + 1}
			</h5>

			<div className="flex flex-col gap-12">
				<Controller
					key={currentQuestion.questionId}
					control={control}
					name={`quiz.questions.${index}.statement`}
					render={({ field }) => (
						<MarkdownField content={field.value} setValue={field.onChange} />
					)}
				/>

				<Divider />

				{children}

				<Divider />

				<HintForm questionIndex={index} />
			</div>
		</div>
	);
}

function HintForm({ questionIndex }: { questionIndex: number }) {
	const { control } = useFormContext<QuizForm>();

	const {
		append,
		remove,
		fields: hints
	} = useFieldArray({
		control,
		name: `quiz.questions.${questionIndex}.hints`
	});

	function addHint() {
		append({
			hintId: getRandomId(),
			content: ""
		});
	}

	function removeHint(hintIndex: number) {
		const confirmed = window.confirm(t("remove_hint"));
		if (confirmed) {
			remove(hintIndex);
		}
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<h5 className="text-2xl font-semibold tracking-tight">{t("hints")}</h5>

				<AddButton
					onAdd={addHint}
					title={t("add_hint")}
					label={<span>{t("add_hint")}</span>}
				/>
			</div>

			<p className="text-sm text-light">{t("hint_text")}</p>

			{hints.map((hint, hintIndex) => (
				<div
					key={hint.hintId}
					className="flex flex-col gap-4 rounded-lg border border-yellow-500 bg-yellow-100  p-4"
				>
					<DeleteButton
						onDelete={() => removeHint(hintIndex)}
						additionalClassNames={"self-end"}
						title={t("remove_hint")}
					/>

					<Controller
						control={control}
						name={`quiz.questions.${questionIndex}.hints.${hintIndex}.content`}
						render={({ field }) => (
							<MarkdownField content={field.value} setValue={field.onChange} />
						)}
					></Controller>
				</div>
			))}
		</section>
	);
}
