import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, createLessonMeta } from "@self-learning/types";
import { SectionHeader, showToast } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
import { LessonContentEditor } from "./forms/lesson-content";
import { LessonInfoEditor } from "./forms/lesson-info";
import { QuizEditor } from "./forms/quiz-editor";
import { LessonFormModel } from "./lesson-form-model";
import { LessonType } from "@prisma/client";
import { useRouter } from "next/router";

export function LessonEditor({
	lesson,
	onConfirm
}: {
	lesson: LessonFormModel;
	onConfirm: (lesson: LessonFormModel) => void;
}) {
	const isNew = lesson.lessonId === "";
	const form = useForm<LessonFormModel>({
		resolver: zodResolver(lessonSchema),
		defaultValues: lesson
	});

	const [selectedLessonType, setLessonType] = useState(lesson.lessonType);
	const router = useRouter();

	const [isFromPreview, setIsFromPreview] = useState(false);

	useEffect(() => {
		// Log an error, if given lesson data does not match the form's expected schema
		// Only validate when the lesson is not new, because otherwise the form is empty
		if (lesson.lessonId !== "") {
			const validation = lessonSchema.safeParse(lesson);

			if (!validation.success) {
				console.error(
					"The lesson object that was passed into the LessonEditor is invalid.",
					validation.error
				);
			}
		}
	}, [lesson]);

	useEffect(() => {
		if (router.isReady) {
			const dataFromPreview = router.query["fromPreview"];
			const isFromPreviewBool = dataFromPreview === "true";
			setIsFromPreview(isFromPreviewBool);
		}
	}, [router.isReady, router.query]);

	function redirectToPreview() {
		const currentLessonValues = form.getValues();
		const lessonMeta = createLessonMeta(currentLessonValues);
		const currentLessonValuesWithMeta = { ...currentLessonValues, meta: lessonMeta };
		const serializedData = JSON.stringify(currentLessonValuesWithMeta);
		localStorage.setItem("lessonInEditing", serializedData);

		const courseId = router.query["courseId"] ? router.query["courseId"] : "placeholder";
		const lessonId = currentLessonValues.lessonId
			? currentLessonValues.lessonId
			: "placeholder";
		const lessonTitle = currentLessonValues.title;

		router.push({
			pathname: `/teaching/preview/${courseId}/${lessonId}`,
			query: { lessonTitle }
		});
	}

	return (
		<div className="bg-gray-50">
			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(
						data => {
							onConfirm(data);
						},
						onInvalid => {
							console.log(
								"Form could not be saved due to the following errors:",
								onInvalid
							);
							showToast({
								type: "error",
								title: "Speichern fehlgeschlagen",
								subtitle: "Das Formular enthält ungültige Werte."
							});
						}
					)}
					className="flex flex-col"
				>
					<SidebarEditorLayout
						sidebar={
							<>
								<div>
									<span className="font-semibold text-secondary">
										Lerneinheit editieren
									</span>

									<h1 className="text-2xl">{lesson.title}</h1>
								</div>

								<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
								<button
									className="btn-stroked"
									onClick={redirectToPreview}
									type="button"
								>
									Vorschau
								</button>

								<button className="btn-primary w-full" type="submit">
									{isNew ? "Erstellen" : "Speichern"}
								</button>
								{isFromPreview ? (
									<LessonInfoEditor
										setLessonType={setLessonType}
										lessonInEditing={lesson}
									/>
								) : (
									<LessonInfoEditor setLessonType={setLessonType} />
								)}
							</>
						}
					>
						<LessonDescriptionForm />
						{selectedLessonType === LessonType.SELF_REGULATED && (
							<LessonPreQuestionEditor />
						)}
						<LessonContentEditor />
						<QuizEditor />
					</SidebarEditorLayout>
				</form>
			</FormProvider>
		</div>
	);
}

function LessonDescriptionForm() {
	const { control, setValue } = useFormContext<LessonFormModel>();

	const router = useRouter();
	const { query } = router;
	const [descriptionFromPreview, setDescriptionFromPreview] = useState("");

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				if (storedData) {
					const lessonData = JSON.parse(storedData);
					const description = lessonData.description ? lessonData.description : "";
					setDescriptionFromPreview(description);
				}
			}
		}
	}, [query]);

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			setValue("description", descriptionFromPreview);
		}
	}, [descriptionFromPreview]);

	return (
		<section>
			<SectionHeader
				title="Beschreibung"
				subtitle="Ausführliche Beschreibung dieser Lerneinheit. Unterstützt Markdown."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}

function LessonPreQuestionEditor() {
	const { control } = useFormContext<LessonFormModel>();

	return (
		<section>
			<SectionHeader
				title="Aktivierungsfrage"
				subtitle="Die Aktivierungsfrage, die den Lernenden helfen soll, ihre Wissensbasis zu aktivieren."
			/>
			<Form.MarkdownWithPreviewContainer>
				<Controller
					control={control}
					name="selfRegulatedQuestion"
					render={({ field }) => (
						<MarkdownField content={field.value as string} setValue={field.onChange} />
					)}
				></Controller>
			</Form.MarkdownWithPreviewContainer>
		</section>
	);
}
