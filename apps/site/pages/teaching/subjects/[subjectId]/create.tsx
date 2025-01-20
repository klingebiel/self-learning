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
import { OpenAsJsonButton } from "@self-learning/ui/forms";
import { useRouter } from "next/router";
import { FormProvider, useForm } from "react-hook-form";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export default function SpecializationPage() {
	useRequiredSession();
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

			showToast({ type: "success", title: "Spezialisierung erstellt", subtitle: spec.title });
			router.push(`/teaching/subjects/${subjectId}/${spec.specializationId}/edit`);
		} catch (error) {
			console.error(error);

			if (error instanceof TRPCClientError) {
				showToast({ type: "error", title: "Fehler", subtitle: error.message });
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
									Spezialisierung{" "}
									{initialSpecialization.specializationId === ""
										? "erstellen"
										: "speichern"}
								</span>

								<h1 className="text-2xl">
									{initialSpecialization.specializationId === ""
										? "Neue Spezialisierung"
										: initialSpecialization.title}
								</h1>
							</div>

							<OpenAsJsonButton form={form} validationSchema={specializationSchema} />

							<button className="btn-primary w-full" type="submit">
								{initialSpecialization.specializationId === ""
									? "Erstellen"
									: "Speichern"}
							</button>

							<Form.SidebarSection>
								<Form.SidebarSectionTitle
									title="Informationen"
									subtitle="Informationen über diese Spezialisierung."
								></Form.SidebarSectionTitle>
								<div className="flex flex-col gap-4">
									<LabeledField label="Titel" error={errors.title?.message}>
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
													Generieren
												</button>
											}
										/>
										<FieldHint>
											Der <strong>slug</strong> wird in der URL angezeigt.
											Muss einzigartig sein.
										</FieldHint>
									</LabeledField>

									<LabeledField
										label="Untertitel"
										error={errors.subtitle?.message}
									>
										<textarea
											className="textfield"
											{...register("subtitle")}
											rows={16}
										/>
										<FieldHint>
											Beschreibung dieser Spezialisierung in 2-3 Sätzen.
										</FieldHint>
									</LabeledField>
								</div>
							</Form.SidebarSection>
						</>
					}
				>
					<section>
						<SectionHeader
							title="Bild (Banner)"
							subtitle="Bild, das als Banner am Seitenbeginn angezeigt wird."
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
							title="Bild (Karte)"
							subtitle="Bild das auf Karten angezeigt wird."
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

export async function getServerSideProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await serverSideTranslations(locale, ["common"]))
		}
	};
}
