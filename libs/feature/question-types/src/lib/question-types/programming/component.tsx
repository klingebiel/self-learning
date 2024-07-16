import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { EditorField, LabeledField } from "@self-learning/ui/forms";
import { TRPCClientError } from "@trpc/client";
import { useEffect, useState } from "react";
import { useQuestion } from "../../use-question-hook";
import { evaluateProgramming } from "./evaluate";
import { Programming } from "./schema";
import { t } from "i18next";

export type PistonFile = {
	name: string;
	content: string;
};

export type ExecuteRequest = {
	/** The language to use for execution, must be a string and must be installed. */
	language: string;
	/** The version of the language to use for execution, must be a string containing a SemVer selector for the version or the specific version number to use. */
	version: string;
	/** An array of files containing code or other data that should be used for execution. The first file in this array is considered the main file. */
	files: PistonFile[];
	/** The text to pass as stdin to the program. Must be a string or left out. Defaults to blank string. */
	stdin?: string;
	/** The arguments to pass to the program. Must be an array or left out. Defaults to []. */
	args?: string[];
	/** The maximum time allowed for the compile stage to finish before bailing out in milliseconds. Must be a number or left out. Defaults to 10000 (10 seconds). */
	compile_timeout?: number;
	/** The maximum time allowed for the run stage to finish before bailing out in milliseconds. Must be a number or left out. Defaults to 3000 (3 seconds). */
	run_timeout?: number;
	/** The maximum amount of memory the compile stage is allowed to use in bytes. Must be a number or left out. Defaults to -1 (no limit). */
	compile_memory_limit?: number;
	/** The maximum amount of memory the run stage is allowed to use in bytes. Must be a number or left out. Defaults to -1 (no limit). */
	run_memory_limit?: number;
};

export type IncompleteExecuteRequest = Pick<ExecuteRequest, "files" | "stdin" | "args">;

export type ExecuteResponse = {
	/** Name (not alias) of the runtime used. */
	language: string;
	/** Version of the used runtime. */
	version: string;
	/** Results from the run stage. */
	run: Output;
	/** Results from the compile stage, only provided if the runtime has a compile stage */
	compile?: Output;
};

export type StdinMessage = {
	type: "data";
	stream: "stdin";
	data: string;
};

type Output = {
	stdout: string;
	stderr: string;
	output: string;
	code: number;
	signal: string;
};

const EXTENSION: Record<string, string> = {
	java: "java",
	typescript: "ts",
	javascript: "js",
	python: "py"
};

export default function ProgrammingAnswer() {
	const { setAnswer, answer, question, evaluation, setEvaluation } = useQuestion("programming");
	const [output, setOutput] = useState({
		isLoading: false,
		isError: false,
		text: "",
		signal: null as string | null
	});

	const { data: runtimes } = trpc.programming.runtimes.useQuery();
	const { mutateAsync: execute } = trpc.programming.execute.useMutation();

	const [version, setVersion] = useState<string | undefined>(undefined);

	useEffect(() => {
		console.log("Available runtimes:", runtimes);
		setVersion(runtimes?.find(r => r.language === question.language)?.version);
	}, [question.language, runtimes]);

	async function runCode() {
		const language = question.language;

		if (!version) {
			// We could also use "*" instead of supplying a version
			// but this way we can check, whether server is online and supports language
			console.log(`Language ${language} is not available.`);

			setOutput({
				isError: true,
				signal: null,
				text: `Language "${language}" is not available.\` Code execution server might be offline or language is not installed.`,
				isLoading: false
			});

			return;
		}

		const files: PistonFile[] = [];

		// Main file must be first item in files array
		if (question.custom.mode === "callable") {
			files.push({ name: `Main.${EXTENSION[language]}`, content: question.custom.mainFile });

			if (question.language === "typescript") {
				files.push({ name: "package.json", content: "{ 'type': 'module' }" });
				files.push({
					name: "tsconfig.json",
					content: `{
				"compilerOptions": {
				"target": "es2015",
				"module": "commonjs",
				"rootDir": "."
				}
			  }
			`
				});
			}
		}

		files.push({ name: `Solution.${EXTENSION[language]}`, content: answer.value.solution });

		const executeRequest: ExecuteRequest = { language, version, files };

		console.log("Executing code: ", executeRequest);
		setOutput({ isError: false, signal: null, text: "Executing...", isLoading: true });

		try {
			const data = await execute(executeRequest);

			console.log("Execution finished with", {
				signal: data.run.signal,
				code: data.run.code
			});

			setOutput({
				isError: data.run.code === 1, // 0 indicates success that program ran without errors
				text: data.run.output,
				signal: data.run.signal,
				isLoading: false
			});

			const newAnswer: Programming["answer"] = {
				type: "programming",
				value: {
					solution: answer.value.solution,
					stdout: data.run.output,
					signal: data.run.signal,
					code: data.run.code
				}
			};

			setAnswer(newAnswer);

			setEvaluation(evaluateProgramming(question, newAnswer));
		} catch (error) {
			if (error instanceof TRPCClientError) {
				setOutput({
					isError: true,
					signal: null,
					text: error.message,
					isLoading: false
				});
			} else {
				setOutput({
					isError: true,
					signal: null,
					text: "UNEXPECTED SERVER ERROR",
					isLoading: false
				});
			}

			console.error(error);
		}
	}

	return (
		<div>
			<div className="flex items-center justify-between rounded-t-lg bg-gray-200 p-4">
				<span className="text-xs text-light">
					{question.language} ({version ?? "not installed"}) (mode: {question.custom.mode}
					)
				</span>

				<button className="btn-primary" onClick={runCode} disabled={output.isLoading}>
					{t("run")}
				</button>
			</div>
			<div className="flex flex-wrap gap-2">
				<div className="w-full">
					<EditorField
						value={answer.value.solution}
						onChange={v => {
							setAnswer({
								type: "programming",
								value: {
									solution: v ?? "",
									stdout: answer.value.stdout,
									signal: answer.value.signal,
									code: answer.value.code
								}
							});
						}}
						language={question.language}
					/>
				</div>

				{<TestCaseResult evaluation={evaluation} isExecuting={output.isLoading} />}

				{output.isError && (
					<LabeledField label={t("output")}>
						<div className="flex h-fit max-h-[400px] w-full shrink-0 flex-col gap-4 rounded-lg border border-light-border bg-white">
							<div className="playlist-scroll h-full overflow-auto p-4">
								{output.text !== "" ? (
									<pre
										className={`font-mono ${
											output.isError ? "text-red-500" : ""
										}`}
									>
										{output.text}
									</pre>
								) : (
									<span className="flex flex-col gap-2 text-light">
										<span>{t("no_output")}.</span>
										{output.signal && (
											<span className="text-xs text-light text-red-500">
												{t("process_finished_text", output.signal)}
											</span>
										)}
									</span>
								)}
							</div>
						</div>
					</LabeledField>
				)}
			</div>
		</div>
	);
}

function TestCaseResult({
	evaluation,
	isExecuting
}: {
	evaluation: Programming["evaluation"] | null;
	isExecuting: boolean;
}) {
	const failedCases = [];
	const successCases = [];

	const firstFailedTestIndex = evaluation?.testCases.findIndex(tc => !tc.verdict) ?? -1;
	const firstFailedTest =
		firstFailedTestIndex >= 0 ? evaluation?.testCases[firstFailedTestIndex] : null;

	if (evaluation) {
		for (const testCase of evaluation.testCases) {
			if (testCase.verdict === true) {
				successCases.push(testCase);
			} else {
				failedCases.push(testCase);
			}
		}
	}

	return (
		<section className="flex w-full flex-col gap-4 rounded-lg border border-light-border bg-white p-4">
			<span className="flex items-center gap-2 text-xl font-semibold tracking-tighter">
				{isExecuting ? (
					<LoadingCircle />
				) : !evaluation || evaluation.testCases.length === 0 ? (
					<QuestionMarkCircleIcon className="h-6 text-slate-400" />
				) : successCases.length < evaluation?.testCases.length ? (
					<XCircleIcon className="h-6 text-red-500" />
				) : (
					<CheckCircleIcon className="h-6 text-emerald-500" />
				)}
				<span>{t("test_cases")}:</span>
				<span>
					{successCases.length} / {evaluation?.testCases.length ?? "?"}
				</span>
			</span>

			{firstFailedTest && (
				<>
					<span className="font-semibold">
						<p className="text-red-500">
							{t("test")} #{firstFailedTestIndex + 1}
						</p>
					</span>

					<ProgramOutput label={t("input")} output={firstFailedTest.title} />
					<ProgramOutput
						label={t("expected")}
						output={firstFailedTest.expected.join("\n")}
					/>
					<ProgramOutput label={t("output")} output={firstFailedTest.actual.join("\n")} />
				</>
			)}
		</section>
	);
}

function ProgramOutput({ label, output }: { label: string; output: string }) {
	return (
		<span className="">
			<span className="text-sm font-medium text-light">{label}:</span>
			<pre className="playlist-scroll min-h-[32px] overflow-auto rounded bg-gray-50 px-2 py-1">
				{output}
			</pre>
		</span>
	);
}

function LoadingCircle() {
	return (
		<svg
			className="h-6 w-6 animate-spin text-secondary"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			></circle>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	);
}
