import { LicenseForm } from "@self-learning/teaching";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	MarkdownField,
	useSlugify
} from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { AuthorsForm } from "../../author/authors-form";
import { LessonFormModel } from "../lesson-form-model";
import { SkillForm } from "./skills-form";
import { lessonSchema } from "@self-learning/types";
import { OpenAsJsonButton } from "../../json-editor-dialog";
import { LabeledCheckbox } from "../../../../../../ui/forms/src/lib/labeled-checkbox";
import { DefaultButton } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";

export function LessonInfoEditor({ lesson }: { lesson?: LessonFormModel }) {
	const form = useFormContext<LessonFormModel>();
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<Form.SidebarSection>
			<div>
				<span className="font-semibold text-secondary">{t("edit_lesson")}</span>

				<h1 className="text-2xl">{lesson?.title}</h1>
			</div>

			<Form.SidebarSectionTitle title={t("data")} subtitle={t("lesson_info")} />
			<OpenAsJsonButton form={form} validationSchema={lessonSchema} />

			<div className="flex flex-col gap-4">
				<LabeledField label={t("title")} error={errors.title?.message}>
					<input
						{...register("title")}
						type="text"
						className="textfield"
						placeholder={t("new_lesson")}
						onBlur={slugifyIfEmpty}
					/>
				</LabeledField>

				<LabeledField label="Slug" error={errors.slug?.message}>
					<InputWithButton
						input={
							<input
								className="textfield"
								placeholder={t("new_lesson_slug")}
								type={"text"}
								{...register("slug")}
							/>
						}
						button={
							<DefaultButton onClick={slugifyField} title={"Generiere Slug"}>
								<span className={"text-gray-600"}>{t("generate")}</span>
							</DefaultButton>
						}
					/>
					<FieldHint>
						{t("lesson_slug_URL_text_1")} <strong>slug</strong>{" "}
						{t("lesson_slug_URL_text_2")}
					</FieldHint>
				</LabeledField>

				<LabeledField
					label={t("subtitle")}
					error={errors.subtitle?.message}
					optional={true}
				>
					<Controller
						control={control}
						name="subtitle"
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder={t("lesson_description_sentences")}
							/>
						)}
					></Controller>
				</LabeledField>

				<LabeledField
					label={t("description")}
					error={errors.description?.message}
					optional={true}
				>
					<Controller
						control={control}
						name={"description"}
						render={({ field }) => (
							<MarkdownField
								content={field.value as string}
								setValue={field.onChange}
								inline={true}
								placeholder={t("lesson_description_sentences")}
							></MarkdownField>
						)}
					></Controller>
				</LabeledField>

				<LabeledField
					label={t("self_regulated_learning")}
					error={errors.selfRegulatedQuestion?.message}
					optional={false}
				>
					<Controller
						control={control}
						name={"lessonType"}
						render={({ field }) => (
							<LabeledCheckbox
								label={t("active_question_and_sequential_check")}
								checked={field.value === "SELF_REGULATED"}
								onChange={e => {
									field.onChange(
										e.target.checked ? "SELF_REGULATED" : "TRADITIONAL"
									);
								}}
							></LabeledCheckbox>
						)}
					></Controller>
				</LabeledField>

				<AuthorsForm
					subtitle={t("authors_from_lesson")}
					emptyString={t("lesson_missing_authors")}
				/>

				<LicenseForm />

				<SkillForm />
			</div>
		</Form.SidebarSection>
	);
}
