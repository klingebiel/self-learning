import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { Author, authorSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LoadingBox,
	OnDialogCloseFn,
	showToast
} from "@self-learning/ui/common";
import { LabeledField, Upload } from "@self-learning/ui/forms";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function EditAuthorDialog({
	username,
	onClose
}: {
	username: string;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { data: user, isLoading } = trpc.author.getAuthorForForm.useQuery({ username });

	return (
		<Dialog onClose={() => onClose(undefined)} title={user?.author?.displayName ?? username}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{user && user.author && (
						<AuthorForm
							username={username}
							onClose={onClose}
							initialAuthor={{
								displayName: user.author.displayName,
								imgUrl: user.author.imgUrl,
								slug: user.author.slug,
								subjectAdmin: user.author.subjectAdmin.map(s => ({
									subjectId: s.subject.subjectId
								})),
								specializationAdmin: user.author.specializationAdmin.map(s => ({
									specializationId: s.specialization.specializationId
								}))
							}}
						/>
					)}
				</>
			)}
		</Dialog>
	);
}

function AuthorForm({
	initialAuthor,
	username,
	// user,
	onClose
}: {
	/** Initial data to populate the form.  */
	initialAuthor: Author;
	username: string;
	onClose: OnDialogCloseFn<Author>;
}) {
	const { t } = useTranslation();
	const { mutateAsync: updateAuthor } = trpc.author.updateAsAdmin.useMutation();
	const form = useForm({
		resolver: zodResolver(authorSchema),
		defaultValues: initialAuthor
	});

	function onSubmit(author: Author) {
		console.log("Saving author...", author);

		updateAuthor({ author, username })
			.then(res => {
				showToast({
					type: "success",
					title: t("author_saved"),
					subtitle: res.displayName
				});
				onClose(undefined);
			})
			.catch(err => {
				console.error(err);
				showToast({
					type: "error",
					title: t("error"),
					subtitle: t("author_save_error")
				});
			});
	}

	return (
		<FormProvider {...form}>
			<form
				className="flex flex-col justify-between overflow-hidden"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="absolute top-8 right-8">
					<OpenAsJsonButton form={form} validationSchema={authorSchema} />
				</div>

				<div className="grid gap-8 overflow-y-auto xl:grid-cols-[400px_600px] xl:overflow-y-auto">
					<AuthorData />
					<Permissions />
				</div>

				<div className="absolute bottom-10 right-10 xl:right-14">
					<DialogActions onClose={onClose}>
						<button className="btn-primary" type="submit">
							{t("save")}
						</button>
					</DialogActions>
				</div>
			</form>
		</FormProvider>
	);
}

function AuthorData() {
	const { t } = useTranslation();
	const { register, control, setValue, formState } = useFormContext<Author>();
	const imgUrl = useWatch({ control: control, name: "imgUrl" });
	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">{t("data")}</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label={t("name")} error={errors.displayName?.message}>
					<input className="textfield" type={"text"} {...register("displayName")} />
				</LabeledField>
				<LabeledField label="Slug" error={errors.slug?.message}>
					<input className="textfield" type={"text"} {...register("slug")} />
				</LabeledField>
				<LabeledField label={t("image")} error={errors.imgUrl?.message}>
					<div className="flex w-full gap-4">
						<div className="flex w-full flex-col gap-2">
							<input
								className="textfield w-full"
								type={"text"}
								placeholder={"https://example.com/image.png"}
								{...register("imgUrl")}
							/>
							<Upload
								mediaType="image"
								onUploadCompleted={url => setValue("imgUrl", url)}
								preview={
									<>
										{imgUrl && imgUrl.length > 0 ? (
											<img
												src={imgUrl}
												alt="Avatar"
												className="mx-auto h-32 w-32 shrink-0 rounded-lg object-cover"
											></img>
										) : (
											<div className="mx-auto h-32 w-32  shrink-0 rounded-lg bg-gray-200"></div>
										)}
									</>
								}
							/>
						</div>
					</div>
				</LabeledField>
			</div>
		</section>
	);
}

function Permissions() {
	const { t } = useTranslation();
	const { data: subjects } = trpc.subject.getAllWithSpecializations.useQuery();
	const { control, setValue } = useFormContext<Author>();
	const subjectAdmin = useWatch({ control: control, name: "subjectAdmin" });
	const specializationAdmin = useWatch({ control: control, name: "specializationAdmin" });

	return (
		<section className="flex flex-col gap-8">
			<section className="flex h-full flex-col gap-4 rounded-lg border border-light-border p-4">
				<h2 className="text-2xl">{t("permissions")}</h2>
				<p className="text-sm text-light">TODO: Beschreibung der Rechte</p>
				<div className="flex gap-4">
					{!subjects ? (
						<LoadingBox />
					) : (
						<ul className="flex flex-col gap-2">
							{subjects.map(subject => (
								<li key={subject.subjectId}>
									<div className="flex flex-col">
										<span className="flex items-center gap-2">
											<input
												id={subject.subjectId}
												type={"checkbox"}
												className="checkbox"
												checked={
													!!subjectAdmin.find(
														s => s.subjectId === subject.subjectId
													)
												}
												onChange={e => {
													if (e.target.checked) {
														setValue(
															"subjectAdmin",
															[...subjectAdmin, subject].sort(
																(a, b) =>
																	a.subjectId.localeCompare(
																		b.subjectId
																	)
															)
														);
													} else {
														setValue(
															"subjectAdmin",
															subjectAdmin.filter(
																s =>
																	s.subjectId !==
																	subject.subjectId
															)
														);
													}
												}}
											/>
											<label
												htmlFor={subject.subjectId}
												className="text-sm font-semibold"
											>
												{subject.title}
											</label>
										</span>
										<ul className="py-2 pl-8 text-sm">
											{subject.specializations.map(specialization => (
												<li
													key={specialization.specializationId}
													className="flex items-center gap-2"
												>
													<input
														type="checkbox"
														id={specialization.specializationId}
														className="checkbox"
														checked={
															!!specializationAdmin.find(
																s =>
																	s.specializationId ===
																	specialization.specializationId
															)
														}
														onChange={e => {
															if (e.target.checked) {
																setValue(
																	"specializationAdmin",
																	[
																		...specializationAdmin,
																		specialization
																	].sort((a, b) =>
																		a.specializationId.localeCompare(
																			b.specializationId
																		)
																	)
																);
															} else {
																setValue(
																	"specializationAdmin",
																	specializationAdmin.filter(
																		s =>
																			s.specializationId !==
																			specialization.specializationId
																	)
																);
															}
														}}
													/>
													<label
														htmlFor={specialization.specializationId}
													>
														{specialization.title}
													</label>
												</li>
											))}
										</ul>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>
		</section>
	);
}
