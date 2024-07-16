import { Dialog, DialogActions, OnDialogCloseFn } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import {
	LessonEditor,
	LessonFormModel,
	onLessonCreatorSubmit,
	onLessonEditorSubmit
} from "@self-learning/teaching";
import { trpc } from "@self-learning/api-client";
import React from "react";
import { useTranslation } from "react-i18next";

export function CreateLessonDialog({
	setCreateLessonDialogOpen
}: {
	setCreateLessonDialogOpen: (open: boolean) => void;
}) {
	const { mutateAsync: createLessonAsync } = trpc.lesson.create.useMutation();

	async function handleCreateDialogClose(lesson?: LessonFormModel) {
		await onLessonCreatorSubmit(
			() => {
				setCreateLessonDialogOpen(false);
			},
			createLessonAsync,
			lesson
		);
	}

	return <LessonEditorDialogWithGuard onClose={handleCreateDialogClose} />;
}

export function EditLessonDialog({
	initialLesson,
	setLessonEditorDialog
}: {
	initialLesson?: LessonFormModel;
	setLessonEditorDialog: (value: boolean) => void;
}) {
	const { mutateAsync: editLessonAsync } = trpc.lesson.edit.useMutation();
	const handleEditDialogClose: OnDialogCloseFn<LessonFormModel> = async updatedLesson => {
		await onLessonEditorSubmit(
			() => {
				setLessonEditorDialog(false);
			},
			editLessonAsync,
			updatedLesson
		);
	};

	return (
		<LessonEditorDialogWithGuard
			initialLesson={initialLesson}
			onClose={handleEditDialogClose}
		/>
	);
}

function LessonEditorDialogWithGuard({
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

	return (
		<div>
			{canEdit ? (
				<LessonEditorDialog initialLesson={initialLesson} onClose={onClose} />
			) : (
				<NoPermissionToEditComponent initialLesson={initialLesson} onClose={onClose} />
			)}
		</div>
	);
}

function LessonEditorDialog({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const { t } = useTranslation();
	return (
		<Dialog
			title={!initialLesson ? t("create_new_lesson") : t("edit_lesson")}
			onClose={() => window.confirm(t("confirm_no_changes")) && onClose(undefined)}
			style={{ height: "80vh", width: "80vw" }}
		>
			<div className="absolute right-8 top-8 flex gap-4">
				<a
					className="btn-stroked focus:primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
					target="_blank"
					rel="noreferrer"
					href={
						initialLesson
							? `/teaching/lessons/edit/${initialLesson?.lessonId}`
							: `/teaching/lessons/create`
					}
					title={t("open_formular_in_new_tab")}
				>
					{t("open_separated_editor")}
				</a>
			</div>
			<LessonEditor onSubmit={onClose} initialLesson={initialLesson} isFullScreen={false} />
		</Dialog>
	);
}

function NoPermissionToEditComponent({
	onClose,
	initialLesson
}: {
	onClose: OnDialogCloseFn<LessonFormModel>;
	initialLesson?: LessonFormModel;
}) {
	const { t } = useTranslation();
	if (!initialLesson) return <></>;

	return (
		<Dialog title={t("not_allowed")} onClose={onClose}>
			<div className="flex flex-col gap-8">
				<p className="text-light">{t("edit_lesson_denied")}</p>

				<div className="flex flex-col">
					<span className="font-semibold">{t("title")}:</span>
					<span className="font-semibold text-secondary">{initialLesson.title}</span>
				</div>

				<div>
					<span className="font-semibold">{"authors"}:</span>

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
