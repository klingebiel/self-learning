import { ImageOrPlaceholder } from "@self-learning/ui/common";
import { Form, InputWithButton, LabeledField, Upload, useSlugify } from "@self-learning/ui/forms";
import { Controller, useFormContext } from "react-hook-form";
import { CourseFormModel } from "./course-form-model";
import { useTranslation } from "react-i18next";

/**
 * Allows the user to edit basic information about a course,
 * such as the `title`, `slug`, `subtitle`, `description`.
 *
 * Must be wrapped in a provider that provides the form context.
 *
 * @example
 *	const methods = useForm<CourseFormModel>({
 *		defaultValues: { ...course }
 *	});
 *
 * return (
 * 	<FormProvider {...methods}>
 * 		<CourseInfoForm />
 * 	</FormProvider>
 * )
 */
export function CourseInfoForm() {
	const { t } = useTranslation();
	const form = useFormContext<CourseFormModel & { content: unknown[] }>(); // widen content type to prevent circular path error
	const {
		register,
		control,
		formState: { errors }
	} = form;
	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title={t("data")} subtitle={t("course_info")} />

			<div className="flex flex-col gap-4">
				<LabeledField label={t("title")} error={errors.title?.message}>
					<input
						{...register("title")}
						type="text"
						className="textfield"
						placeholder={t("new_unit")}
						onBlur={slugifyIfEmpty}
					/>
				</LabeledField>
				<LabeledField label="Slug" error={errors.slug?.message}>
					<InputWithButton
						input={
							<input
								className="textfield"
								placeholder={t("new_unit_slug")}
								type={"text"}
								{...register("slug")}
							/>
						}
						button={
							<button type="button" className="btn-stroked" onClick={slugifyField}>
								{t("generate")}
							</button>
						}
					/>
				</LabeledField>

				<LabeledField label={t("sub_title")} error={errors.subtitle?.message}>
					<textarea
						{...register("subtitle")}
						placeholder={t("sub_title_placeholder")}
						className="h-full"
					/>
				</LabeledField>

				<LabeledField label={t("image")} error={errors.imgUrl?.message} optional={true}>
					<Controller
						control={control}
						name="imgUrl"
						render={({ field }) => (
							<Upload
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
				</LabeledField>
			</div>
		</Form.SidebarSection>
	);
}
