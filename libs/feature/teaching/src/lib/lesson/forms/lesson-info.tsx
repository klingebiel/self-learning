import { LicenseForm } from "@self-learning/teaching";
import { ImageOrPlaceholder } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	MarkdownField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../../author/authors-form";
import { LessonFormModel } from "../lesson-form-model";
import { LessonType } from "@prisma/client";
import { Dispatch, useEffect } from "react";
import SkillForm from "./skills-form";
import { useRouter } from "next/router";

export function LessonInfoEditor({
	setLessonType,
	lessonInEditing
}: {
	setLessonType: Dispatch<LessonType>;
	lessonInEditing?: Partial<LessonFormModel>;
}) {
	const form = useFormContext<LessonFormModel>();
	const {
		register,
		control,
		formState: { errors },
		setValue
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	const router = useRouter();
	const { query } = router;

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				if (storedData) {
					const lessonData = JSON.parse(storedData);
					setValue("title", lessonData.title);
					setValue("slug", lessonData.slug);
					setValue("subtitle", lessonData.subtitle);
					setValue("lessonType", lessonData.lessonType);
				}
			}
		}
	}, [query, setValue]);

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle
				title="Daten"
				subtitle="Informationen über diese Lerneinheit"
			/>

			<div className="flex flex-col gap-4">
				<LabeledField label="Titel" error={errors.title?.message}>
					<input
						{...register("title")}
						type="text"
						className="textfield"
						placeholder="Die Neue Lerneinheit"
						onBlur={slugifyIfEmpty}
					/>
				</LabeledField>

				<LabeledField label="Slug" error={errors.slug?.message}>
					<InputWithButton
						input={
							<input
								className="textfield"
								placeholder="die-neue-lerneinheit"
								type={"text"}
								{...register("slug")}
							/>
						}
						button={
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								Generieren
							</button>
						}
					/>
					<FieldHint>
						Der <strong>slug</strong> wird in der URL angezeigt. Muss einzigartig sein.
					</FieldHint>
				</LabeledField>

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

				<LabeledField label="Lernmodell" error={errors.lessonType?.message}>
					<select
						{...register("lessonType")}
						onChange={e => {
							setLessonType(e.target.value as LessonType);
						}}
					>
						<option value={""} hidden>
							Bitte wählen...
						</option>
						<option value={LessonType.TRADITIONAL}>
							Nanomodul-basiertes Lernen (Standard)
						</option>
						<option value={LessonType.SELF_REGULATED}>Selbstreguliertes Lernen</option>
					</select>
				</LabeledField>

				<LabeledField label="Thumbnail" error={errors.imgUrl?.message}>
					<Controller
						control={control}
						name="imgUrl"
						render={({ field }) => (
							<Upload
								key={"image"}
								mediaType="image"
								onUploadCompleted={field.onChange}
								preview={
									<ImageOrPlaceholder
										src={field.value ?? undefined}
										className="aspect-video w-full rounded-lg object-cover"
									/>
								}
							/>
						)}
					/>
					<FieldHint>Thumbnails werden momentan nicht in der UI angezeigt.</FieldHint>
				</LabeledField>

				<AuthorsForm
					subtitle="Autoren dieser Lerneinheit."
					emptyString="Für diese Lerneinheit sind noch keine Autoren hinterlegt."
				/>

				<SkillForm />

				<LicenseForm />
			</div>
		</Form.SidebarSection>
	);
}
