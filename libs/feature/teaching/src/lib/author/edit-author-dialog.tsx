import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogActions,
	ImageOrPlaceholder,
	OnDialogCloseFn
} from "@self-learning/ui/common";
import { InputWithButton, LabeledField, Upload, useSlugify } from "@self-learning/ui/forms";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export const editAuthorSchema = z.object({
	slug: z.string().min(3),
	displayName: z.string().min(3),
	imgUrl: z.string().nullable()
});

type Author = z.infer<typeof editAuthorSchema>;

export function EditAuthorDialog({
	onClose,
	author
}: {
	author: Author;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { t } = useTranslation();
	const form = useForm({
		defaultValues: author,
		resolver: zodResolver(editAuthorSchema)
	});

	const {
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "displayName", "slug");

	return (
		<Dialog title={author.displayName} onClose={onClose}>
			<form
				onSubmit={form.handleSubmit(onClose, invalid => {
					console.log("invalid", invalid);
				})}
			>
				<div className="flex flex-col gap-4">
					<LabeledField label={t("name")} error={errors.displayName?.message}>
						<input
							{...form.register("displayName")}
							type="text"
							className="textfield"
							autoComplete="off"
						/>
					</LabeledField>

					<LabeledField label="Slug" error={errors.slug?.message}>
						<InputWithButton
							input={
								<input
									{...form.register("slug")}
									onBlur={slugifyIfEmpty}
									type="text"
									className="textfield"
									autoComplete="off"
								/>
							}
							button={
								<button
									type="button"
									className="btn-stroked"
									onClick={slugifyField}
								>
									{t("generate")}
								</button>
							}
						/>
					</LabeledField>

					<Controller
						control={form.control}
						name="imgUrl"
						render={({ field }) => (
							<LabeledField label={t("image")} error={errors.imgUrl?.message}>
								<div className="flex w-full gap-4">
									<div className="flex w-full flex-col gap-2">
										<Upload
											mediaType="image"
											onUploadCompleted={field.onChange}
											preview={
												<ImageOrPlaceholder
													src={field.value ?? undefined}
													className="mx-auto h-32 w-32 shrink-0 rounded-lg"
												/>
											}
										/>
									</div>
								</div>
							</LabeledField>
						)}
					></Controller>
				</div>
				<DialogActions onClose={onClose}>
					<button className="btn-primary">{t("save")}</button>
				</DialogActions>
			</form>
		</Dialog>
	);
}
