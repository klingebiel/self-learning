import { zodResolver } from "@hookform/resolvers/zod";
import { createEmptyLesson, lessonSchema } from "@self-learning/types";
import { Dialog, DialogActions, OnDialogCloseFn, Tab, Tabs } from "@self-learning/ui/common";
import { LabeledField, MarkdownEditorDialog, MarkdownField } from "@self-learning/ui/forms";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../../../author/authors-form";
import { OpenAsJsonButton } from "../../../json-editor-dialog";
import { LessonContentEditor } from "../../../lesson/forms/lesson-content";
import { QuizEditor } from "../../../lesson/forms/quiz-editor";
import { LessonFormModel } from "../../../lesson/lesson-form-model";
import { slugify } from "@self-learning/util/common";
import { useRouter } from "next/router";

export function EditLessonDialog({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const session = useRequiredSession();
	const canEdit =
		session.data?.user.role === "ADMIN" ||
		initialLesson?.authors.some(a => a.username === session.data?.user.name);

	const [selectedTab, setSelectedTab] = useState(0);
	const isNew = !initialLesson;

	const form = useForm<LessonFormModel>({
		context: undefined,
		defaultValues: initialLesson ?? {
			...createEmptyLesson(),
			// Add current user as author
			authors: session.data?.user.isAuthor ? [{ username: session.data.user.name }] : []
		},
		resolver: zodResolver(lessonSchema)
	});

	const router = useRouter();
	const { courseId } = router.query;
	const [courseIdValue, setCourseId] = useState("placeholder"); // TODO this type of name should be probably defined somewhere global

	useEffect(() => {
		if (courseId && typeof courseId === "string") {
			setCourseId(courseId);
		}
	}, [courseId]);

	if (initialLesson?.lessonId && !canEdit) {
		return (
			<Dialog title="Nicht erlaubt" onClose={onClose}>
				<div className="flex flex-col gap-8">
					<p className="text-light">
						Du hast keine Berechtigung, diese Lerneinheit zu bearbeiten:
					</p>

					<div className="flex flex-col">
						<span className="font-semibold">Titel:</span>
						<span className="font-semibold text-secondary">{initialLesson.title}</span>
					</div>

					<div>
						<span className="font-semibold">Autoren:</span>

						<ul className="flex flex-col">
							{initialLesson.authors.map(a => (
								<span className="font-semibold text-secondary">{a.username}</span>
							))}
						</ul>
					</div>
				</div>

				<DialogActions onClose={onClose} />
			</Dialog>
		);
	}

	return (
		<Dialog
			title={isNew ? "Neue Lernheit erstellen" : "Lerneinheit anpassen"}
			onClose={() => window.confirm("Änderungen verwerfen?") && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<FormProvider {...form}>
				<div className="absolute right-8 top-8 flex gap-4">
					<OpenAsJsonButton form={form} validationSchema={lessonSchema} />
					{initialLesson?.lessonId && (
						<a
							className="btn-stroked"
							target="_blank"
							rel="noreferrer"
							href={`/teaching/lessons/edit/${initialLesson?.lessonId}?courseId=${courseIdValue}`}
							title="Formular in einem neuen Tab öffnen. Änderungen werden nicht übernommen."
						>
							Im separaten Editor öffnen
						</a>
					)}
				</div>
				<form
					id="lessonform"
					onSubmit={form.handleSubmit(onClose, console.log)}
					className="flex h-full flex-col overflow-hidden"
				>
					<div className="flex h-full flex-col gap-4 overflow-hidden">
						<Tabs selectedIndex={selectedTab} onChange={v => setSelectedTab(v)}>
							<Tab>Übersicht</Tab>
							<Tab>Lernkontrolle</Tab>
						</Tabs>

						<div className="playlist-scroll flex h-full flex-col gap-4 overflow-auto">
							{selectedTab === 0 && (
								<div className="grid h-full gap-8 xl:grid-cols-[500px_1fr]">
									<Overview />
									<LessonContentEditor />
								</div>
							)}
							{selectedTab === 1 && <QuizEditor />}
						</div>
					</div>

					<DialogActions onClose={onClose}>
						<button type="submit" className="btn-primary">
							Speichern
						</button>
					</DialogActions>
				</form>
			</FormProvider>
		</Dialog>
	);
}

function Overview() {
	const {
		control,
		register,
		getValues,
		setValue,
		formState: { errors }
	} = useFormContext<LessonFormModel>();

	function slugifyTitle() {
		const title = getValues("title");
		const slug = slugify(title, { lower: true });
		setValue("slug", slug);
	}

	const [openDescriptionEditor, setOpenDescriptionEditor] = useState(false);

	return (
		<div className="flex flex-col gap-8">
			<div className="flex h-full w-full flex-col gap-4 rounded-lg border border-light-border p-4">
				<SidebarSectionTitle
					title="Grunddaten"
					subtitle="Grunddaten dieser Lerneinheit."
				></SidebarSectionTitle>

				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						placeholder="Die Neue Lerneinheit"
						onBlur={() => {
							if (getValues("slug") === "") {
								slugifyTitle();
							}
						}}
						autoComplete="off"
					/>
				</LabeledField>

				<div className="grid items-start gap-2 sm:flex">
					<LabeledField label="Slug" error={errors.slug?.message}>
						<input
							{...register("slug")}
							placeholder='Wird in der URL angezeigt, z. B.: "die-neue-lerneinheit"'
							autoComplete="off"
						/>
					</LabeledField>

					<button
						type="button"
						className="btn-stroked h-fit self-end text-sm"
						onClick={slugifyTitle}
					>
						Generieren
					</button>
				</div>

				<LabeledField label="Untertitel" error={errors.subtitle?.message} optional={true}>
					<Controller
						control={control}
						name="subtitle"
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder="1-2 Sätze über diese Lerneinheit."
							/>
						)}
					></Controller>
				</LabeledField>

				<LabeledField label="Beschreibung" optional={true}>
					<textarea
						{...register("description")}
						placeholder="Beschreibung dieser Lernheit. Unterstützt Markdown."
						rows={6}
					/>

					<button
						type="button"
						className="btn-stroked text-sm"
						onClick={() => setOpenDescriptionEditor(true)}
					>
						Markdown Editor öffnen
					</button>

					{openDescriptionEditor && (
						<Controller
							control={control}
							name="description"
							render={({ field }) => (
								<MarkdownEditorDialog
									title="Beschreibung"
									onClose={v => {
										if (v !== undefined) {
											setValue("description", v);
										}
										setOpenDescriptionEditor(false);
									}}
									initialValue={field.value ?? ""}
								/>
							)}
						/>
					)}
				</LabeledField>
				<AuthorsForm
					subtitle="Autoren dieser Lerneinheit."
					emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
				/>
			</div>
		</div>
	);
}
