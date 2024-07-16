import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeader } from "@self-learning/ui/common";
import { Form, MarkdownField } from "@self-learning/ui/forms";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import Link from "next/link";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../author/authors-form";
import { OpenAsJsonButton } from "../json-editor-dialog";
import { CourseContentForm } from "./course-content-editor/course-content-form";
import { CourseFormModel, courseFormSchema } from "./course-form-model";
import { CourseInfoForm } from "./course-info-form";
import { useState } from "react";
import { ExportCourseDialog } from "./course-export/course-export-dialog";
import { useTranslation } from "react-i18next";

export function CourseEditor({
	course,
	onConfirm
}: {
	course: CourseFormModel;
	onConfirm: (course: CourseFormModel) => void;
}) {
	const { t } = useTranslation();
	const isNew = course.courseId === "";

	const form = useForm<CourseFormModel>({
		defaultValues: { ...course },
		resolver: zodResolver(courseFormSchema)
	});

	const [viewExportDialog, setViewExportDialog] = useState(false);
	return (
		<div className="bg-gray-50">
			<FormProvider {...form}>
				<form
					id="courseform"
					onSubmit={e => {
						if ((e.target as unknown as { id: string }).id === "courseform") {
							form.handleSubmit(
								data => {
									console.log("data", data);
									try {
										const validated = courseFormSchema.parse(data);
										onConfirm(validated);
									} catch (error) {
										console.error(error);
									}
								},
								invalid => {
									console.log("invalid", invalid);
								}
							)(e);
						}
					}}
				>
					<SidebarEditorLayout
						sidebar={
							<>
								<div>
									<span className="font-semibold text-secondary">
										{t("edit_course")}
									</span>

									<Link href={`/courses/${course.slug}`} target="_blank">
										<h1 className="text-2xl">{course.title}</h1>
									</Link>
								</div>

								<OpenAsJsonButton form={form} validationSchema={courseFormSchema} />

								<div className="flex space-x-2">
									<button className="btn-primary w-full" type="submit">
										{isNew ? t("create") : t("save")}
									</button>
									<button
										className="btn-primary w-full text-right"
										type="button"
										onClick={() => setViewExportDialog(true)}
									>
										Export
									</button>
								</div>

								<CourseInfoForm />
								<AuthorsForm
									subtitle={t("course_authors")}
									emptyString={t("no_course_authors")}
								/>
							</>
						}
					>
						<CourseDescriptionForm />
						<CourseContentForm />
					</SidebarEditorLayout>
				</form>
			</FormProvider>

			{viewExportDialog && (
				<ExportCourseDialog
					course={course}
					onClose={() => {
						setViewExportDialog(false);
					}}
				/>
			)}
		</div>
	);
}

function CourseDescriptionForm() {
	const { control } = useFormContext<{ description: CourseFormModel["description"] }>();
	const { t } = useTranslation();

	return (
		<section>
			<SectionHeader title={t("description")} subtitle={t("detailed_course_description")} />
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
