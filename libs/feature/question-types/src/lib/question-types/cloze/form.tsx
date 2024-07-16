import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { Fragment, useMemo, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { QuestionTypeForm } from "../../base-question";
import { createCloze } from "./cloze-parser";
import { RenderGapType } from "./component";
import { Cloze } from "./schema";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { useTranslation } from "react-i18next";

export default function ClozeForm({ index }: { question: { type: Cloze["type"] }; index: number }) {
	const { control } = useFormContext<QuestionTypeForm<Cloze["question"]>>();

	const clozeText = useWatch({
		control,
		name: `quiz.questions.${index}.clozeText`
	});

	const cloze = useMemo(() => {
		return createCloze(clozeText);
	}, [clozeText]);

	const [answer, _setAnswer] = useState<string[]>([]);
	const { t } = useTranslation();

	function setAnswer(index: number, value: string) {
		_setAnswer(prev => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-8 xl:grid-cols-2">
				<LabeledField label={t("cloze")}>
					<Controller
						control={control}
						name={`quiz.questions.${index}.clozeText`}
						render={({ field }) => (
							<EditorField value={field.value} onChange={field.onChange} />
						)}
					/>
				</LabeledField>

				<LabeledField label={t("preview")}>
					<pre className="prose h-full max-w-full whitespace-pre-line border border-light-border bg-white p-4 font-sans">
						{cloze.segments.map((segment, index) => (
							<Fragment key={index}>
								<ReactMarkdown
									linkTarget="_blank"
									remarkPlugins={remarkPlugins}
									rehypePlugins={rehypePlugins}
									components={{
										p(props) {
											const { ...rest } = props;
											return <span {...rest} />;
										}
									}}
								>
									{segment ?? ""}
								</ReactMarkdown>
								{cloze.gaps[index] && (
									<RenderGapType
										gap={cloze.gaps[index]}
										index={index}
										setAnswer={setAnswer}
										value={answer[index] ?? ""}
										disabled={false}
									/>
								)}
							</Fragment>
						))}
					</pre>
				</LabeledField>
			</div>

			<ul className="flex list-inside list-disc flex-col rounded-lg bg-gray-200 p-4">
				<li className="flex flex-col gap-2">
					<span className="font-semibold">{t("examples")}</span>
					<span className="rounded-lg bg-white p-2 font-mono">
						{t("text_field_example")}
					</span>
					<span className="rounded-lg bg-white p-2 font-mono">
						{t("single_text_field_example")}
					</span>
					<span className="rounded-lg bg-white p-2 font-mono">{t("latex_example")}</span>
				</li>
			</ul>
		</div>
	);
}
