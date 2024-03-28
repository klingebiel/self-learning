import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { DialogActions, OnDialogCloseFn, showToast, Tab, Tabs } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";

export async function onLessonCreatorSubmit(
	onClose: () => void,
	createLessonAsync: (lesson: LessonFormModel) => Promise<{
		title: string;
	}>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await createLessonAsync(lesson);
			showToast({ type: "success", title: "Lernheit erstellt", subtitle: result.title });
		}
		onClose();
	} catch (error) {
		console.error(error);
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Lerneinheit konnte nicht erstellt werden."
		});
	}
}

export async function onLessonEditorSubmit(
	onClose: () => void,
	editLessonAsync: (lesson: {
		lesson: LessonFormModel;
		lessonId: string;
	}) => Promise<{ title: string }>,
	lesson?: LessonFormModel
) {
	try {
		if (lesson) {
			const result = await editLessonAsync({
				lesson: lesson,
				lessonId: lesson.lessonId as string
			});
			showToast({
				type: "success",
				title: "Lerneinheit gespeichert!",
				subtitle: result.title
			});
		}
		onClose();
	} catch (error) {
		showToast({
			type: "error",
			title: "Fehler",
			subtitle: "Die Lernheit konnte nicht gespeichert werden."
		});
	}
}

export function LessonEditor({
	onSubmit,
	initialLesson
}: {
	onSubmit: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const [selectedTab, setSelectedTab] = useState(0);
	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});
	console.log(initialLesson);
	return (
		<FormProvider {...form}>
			<form
				id="lessonform"
				onSubmit={form.handleSubmit(onSubmit, console.log)}
				className="flex h-full flex-col overflow-hidden"
			>
				<div className="flex h-full overflow-y-auto overflow-x-hidden">
					{selectedTab === 0 && (
						<FirstTabContent
							initialLesson={initialLesson}
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						/>
					)}
					{selectedTab === 1 && (
						<SecondTabContent
							initialLesson={initialLesson}
							selectedTab={selectedTab}
							setSelectedTab={setSelectedTab}
						></SecondTabContent>
					)}
				</div>

				<div className="pointer-events-none fixed bottom-0 flex w-full items-end justify-end">
					<div className="relative pr-3 pb-5">
						<DialogActions onClose={onSubmit}>
							<button type="submit" className="btn-primary">
								Speichern
							</button>
						</DialogActions>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

function FirstTabContent({
	initialLesson,
	selectedTab,
	setSelectedTab
}: {
	initialLesson?: LessonFormModel;
	selectedTab: number;
	setSelectedTab: (v: number) => void;
}) {
	return (
		<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
			<LessonInfoEditor lesson={initialLesson} />

			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
					<Tab>Lerninhalt</Tab>
					<Tab>Lernkontrolle</Tab>
				</Tabs>
				<LessonContentEditor />
			</div>
		</div>
	);
}

function SecondTabContent({
	initialLesson,
	selectedTab,
	setSelectedTab
}: {
	initialLesson?: LessonFormModel;
	selectedTab: number;
	setSelectedTab: (v: number) => void;
}) {
	return (
		<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
			<LessonInfoEditor lesson={initialLesson} />

			<div>
				<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
					<Tab>Lerninhalt</Tab>
					<Tab>Lernkontrolle</Tab>
				</Tabs>
				<QuizEditor />
			</div>
		</div>
	);
}
