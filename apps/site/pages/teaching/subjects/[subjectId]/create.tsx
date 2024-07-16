import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { Specialization, specializationSchema } from "@self-learning/types";
import { ImageOrPlaceholder, SectionHeader, showToast } from "@self-learning/ui/common";
import {
	FieldHint,
	Form,
	InputWithButton,
	LabeledField,
	Upload,
	useSlugify
} from "@self-learning/ui/forms";
import { SidebarEditorLayout, useRequiredSession } from "@self-learning/ui/layouts";
import { TRPCClientError } from "@trpc/client";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function SpecializationPage() {
	useRequiredSession();
	const { t } = useTranslation();
	const router = useRouter();

	const { subjectId } = router.query;

	const { mutateAsync: createSpecialization } = trpc.specialization.create.useMutation();

	const onSubmit: Parameters<typeof SpecializationEditor>[0]["onSubmit"] = async specFromForm => {
		try {
			console.log("Creating specialization", specFromForm);
			const spec = await createSpecialization({
				subjectId: subjectId as string,
				data: specFromForm
			});

			showToast({
				type: "success",
				title: t("specialization_created"),
				subtitle: spec.title
			});
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: t("error"), subtitle: error.message });
			}
		}
	};

	return (
		<div className="bg-gray-50">
			<SpecializationEditor
				onSubmit={onSubmit}
				initialSpecialization={{
					specializationId: "",
					title: "",
					slug: "",
					subtitle: "",
					cardImgUrl: null,
					imgUrlBanner: null
				}}
			/>
		</div>
	);
}

export function SpecializationEditor({
	initialSpecialization,
	onSubmit
}: {
	initialSpecialization: Specialization;
	onSubmit: (specialization: Specialization) => void;
}) {
	const form = useForm<Specialization>({
		resolver: zodResolver(specializationSchema),
		defaultValues: initialSpecialization
	});

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");
	const cardImgUrl = form.watch("cardImgUrl");
	const imgUrlBanner = form.watch("imgUrlBanner");
	const { t } = useTranslation();

	const {
		register,
		formState: { errors }
	} = form;

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<SidebarEditorLayout
					sidebar={
						<>
							<div>
								<span className="font-semibold text-secondary">
									{t("specialization")}{" "}
									{initialSpecialization.specializationId === ""
										? t("create")
										: t("save")}
								</span>

								<h1 className="text-2xl">
									{initialSpecialization.specializationId === ""
										? t("new_specialization")
										: initialSpecialization.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={specializationSchema} />

							<button className="btn-primary w-full" type="submit">
								{initialSpecialization.specializationId === ""
									? t("create")
									: t("save")}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title={t("infos")}
									subtitle={t("infos_for_specialization")}
								></Form.SidebarSectionTitle>
								<div className="flex flex-col gap-4">
									<LabeledField label={t("title")} error={errors.title?.message}>
										<input
											className="textfield"
											type={"text"}
											{...form.register("title")}
											onBlur={slugifyIfEmpty}
										/>
									</LabeledField>

									<LabeledField label="Slug" error={errors.slug?.message}>
										<InputWithButton
											input={
												<input
													className="textfield"
													type={"text"}
													{...form.register("slug")}
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
										<FieldHint>
											{t("show_slug_text_1")} <strong>slug</strong>{" "}
											{t("show_slug_text_2")}
										</FieldHint>
									</LabeledField>

									<LabeledField
										label={t("subtitle")}
										error={errors.subtitle?.message}
									>
										<textarea
											className="textfield"
											{...register("subtitle")}
											rows={16}
										/>
										<FieldHint>{t("specialization_description")}</FieldHint>
									</LabeledField>
								</div>
							</Form.SidebarSection>
						</>
					}
				>
					<section>
						<SectionHeader
							title={t("image_banner_title")}
							subtitle={t("image_banner_subtitle")}
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("imgUrlBanner", url)}
							preview={
								<ImageOrPlaceholder
									src={imgUrlBanner ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>

					<section className="w-fit">
						<SectionHeader
							title={t("image_card_title")}
							subtitle={t("image_card_subtitle")}
						/>

						<Upload
							mediaType="image"
							onUploadCompleted={url => form.setValue("cardImgUrl", url)}
							preview={
								<ImageOrPlaceholder
									src={cardImgUrl ?? undefined}
									className="h-64 rounded-lg object-cover"
								/>
							}
						/>
					</section>
				</SidebarEditorLayout>
			</form>
		</FormProvider>
	);
}
