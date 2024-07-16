import React, { Fragment, useCallback, useRef } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { createCloze, Gap } from "./cloze-parser";
import ReactMarkdown from "react-markdown";
import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Selection } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";
type SetAnswerFn = (index: number, answer: string) => void;

export default function ClozeAnswer() {
	const { question, answer, setAnswer, evaluation } = useQuestion("cloze");

	const cloze = useRef(createCloze(question.clozeText)).current;
	const onUpdateAnswer = useCallback(
		(index: number, ans: string) => {
			setAnswer(prev => ({
				type: "cloze",
				value: { ...prev.value, [index]: ans }
			}));
		},
		[setAnswer]
	);
	const { t } = useTranslation();

	return (
		<>
			<pre className="prose max-w-[75ch] whitespace-pre-line font-sans">
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
								setAnswer={onUpdateAnswer}
								value={answer.value[index] ?? ""}
								disabled={!!evaluation}
							/>
						)}
					</Fragment>
				))}
			</pre>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<ul className="flex flex-col gap-2">
						{evaluation.incorrectAnswers.map(ans => (
							<li key={ans.index} className="flex flex-col">
								<span className="font-medium">
									{t("gap")} {ans.index + 1}:
								</span>
								<span className="pl-4">
									{t("answer")}: {ans.studentAnswer}
								</span>
								<span className="pl-4">
									{t("expected")}: {ans.intendedAnswers.join(" | ")}
								</span>
							</li>
						))}
					</ul>
				</Feedback>
			)}
		</>
	);
}

export function RenderGapType({
	gap,
	setAnswer,
	index,
	value,
	disabled
}: {
	gap: Gap;
	value: string;
	index: number;
	setAnswer: SetAnswerFn;
	disabled: boolean;
}) {
	if (gap.type === "C") {
		const options = gap.values.map(value => (
			<ReactMarkdown
				linkTarget="_blank"
				remarkPlugins={remarkPlugins}
				rehypePlugins={rehypePlugins}
			>
				{value.text ?? ""}
			</ReactMarkdown>
		));
		//renders the current selected value
		const renderedValue = (
			<ReactMarkdown
				linkTarget="_blank"
				remarkPlugins={remarkPlugins}
				rehypePlugins={rehypePlugins}
			>
				{value === "" ? "Select an option" : value}
			</ReactMarkdown>
		);

		return (
			<Selection
				content={options}
				value={renderedValue}
				onChange={valueIndex => setAnswer(index, gap.values[valueIndex].text)}
				disabled={disabled}
			/>
		);
	}

	if (gap.type === "T") {
		return (
			<input
				type="text"
				className="textfield mx-1"
				value={value}
				onChange={e => setAnswer(index, e.target.value)}
				disabled={disabled}
			/>
		);
	}

	return <span className="text-red-500">Unknown gap type: {gap.type}</span>;
}
