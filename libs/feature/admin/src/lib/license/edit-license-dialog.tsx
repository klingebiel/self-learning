import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@self-learning/api-client";
import { License, licenseSchema } from "@self-learning/types";
import {
	Dialog,
	DialogActions,
	LicenseViewModal,
	LoadingBox,
	OnDialogCloseFn,
	QuestionMarkTooltip,
	showToast
} from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { t } from "i18next";
import { OpenAsJsonButton } from "libs/feature/teaching/src/lib/json-editor-dialog";
import { useState } from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function CreateLicenseDialog({ onClose }: { onClose: OnDialogCloseFn<License> }) {
	const { mutateAsync: createLicense } = trpc.licenseRouter.createAsAdmin.useMutation();

	async function onSubmit(license: License) {
		try {
			console.log(license);
			const result = await createLicense({ license: license });
			showToast({
				type: "success",
				title: t("license_created"),
				subtitle: result.name
			});
			onClose(result);
		} catch (err) {
			showToast({
				type: "error",
				title: t("license_not_created"),
				subtitle: t("license_not_created_text")
			});
		}
	}

	return (
		<LicenseFormModal
			license={{
				licenseId: 0,
				name: t("new_license"),
				url: "",
				logoUrl: "",
				licenseText: "",
				selectable: true,
				oerCompatible: false,
				defaultSuggestion: false
			}}
			onSubmit={onSubmit}
			onClose={onClose}
		/>
	);
}

export function EditLicenseDialog({
	licenseId,
	onClose
}: {
	licenseId: number;
	onClose: OnDialogCloseFn<License>;
}) {
	const { t } = useTranslation();
	const { mutateAsync: updateLicense } = trpc.licenseRouter.updateAsAdmin.useMutation();
	const { data: license, isLoading } = trpc.licenseRouter.getOne.useQuery({
		licenseId
	});

	async function onSubmit(license: License) {
		try {
			const result = await updateLicense({ license, licenseId });
			showToast({
				type: "success",
				title: t("license_saved"),
				subtitle: result.name
			});
			onClose(result);
		} catch (err) {
			showToast({
				type: "error",
				title: t("license_not_saved"),
				subtitle: t("license_not_saved_text")
			});
		}
	}

	if (isLoading) {
		return <LoadingBox />;
	} else if (license) {
		return <LicenseFormModal license={license} onSubmit={onSubmit} onClose={onClose} />;
	} else {
		showToast({
			type: "error",
			title: t("license_not_found"),
			subtitle: t("license_not_found_text")
		});
		return null;
	}
}

function LicenseFormModal({
	license,
	onSubmit,
	onClose
}: {
	license: License;
	onSubmit: (license: License) => void;
	onClose: OnDialogCloseFn<License>;
}) {
	return (
		<Dialog
			style={{ height: "80vh", width: "60vw", overflow: "auto" }}
			onClose={() => onClose(undefined)}
			title={license?.name ?? t("new license")}
		>
			{license && (
				<LicenseForm onClose={onClose} initialLicense={license} onSubmit={onSubmit} />
			)}
		</Dialog>
	);
}

function LicenseForm({
	initialLicense,
	onSubmit,
	onClose
}: {
	initialLicense: License;
	onSubmit: (license: License) => void;
	onClose: OnDialogCloseFn<License>;
}) {
	const { t } = useTranslation();
	const form = useForm({
		resolver: zodResolver(licenseSchema),
		defaultValues: initialLicense
	});

	return (
		<FormProvider {...form}>
			<form
				className="m flex flex-col justify-between"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<div className="absolute top-8 right-8 flex">
					<LicensePreviewModal />
					<OpenAsJsonButton form={form} validationSchema={licenseSchema} />
				</div>

				<LicenseDataEditSection />

				<DialogActions onClose={onClose}>
					<button className="btn-primary" type="submit">
						{t("save")}
					</button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}

function LicensePreviewModal() {
	const { t } = useTranslation();
	const [viewLicenseDialog, setViewLicenseDialog] = useState(false);
	const { watch } = useFormContext<License>();
	const formData = watch();

	return (
		<>
			<button
				type="button"
				className="btn-stroked rounded"
				onClick={() => setViewLicenseDialog(true)}
			>
				<span>{t("preview")}</span>
			</button>
			{viewLicenseDialog && (
				<LicenseViewModal
					description={formData.licenseText ?? ""}
					name={formData.name ?? ""}
					logoUrl={formData.logoUrl ?? ""}
					onClose={() => setViewLicenseDialog(false)}
				/>
			)}
		</>
	);
}

function LicenseDataEditSection() {
	const { t } = useTranslation();
	const { register, control, formState, setValue } = useFormContext<License>();
	const selectable = useWatch({ control: control, name: "selectable" });
	const oerCompatible = useWatch({ control: control, name: "oerCompatible" });
	const defaultSuggestion = useWatch({ control: control, name: "defaultSuggestion" });

	const errors = formState.errors;

	return (
		<section className="flex flex-col rounded-lg border border-light-border p-4">
			<h2 className="mb-4 text-2xl">{t("data")}</h2>
			<div className="flex flex-col gap-4">
				<LabeledField label={t("name")} error={errors.name?.message}>
					<input className="textfield" type={"text"} {...register("name")} />
				</LabeledField>
				<LabeledField label={t("license_url")} error={errors.url?.message}>
					<input className="textfield" type={"text"} {...register("url")} />
				</LabeledField>
				<LabeledField label={t("license_image_url")} error={errors.logoUrl?.message}>
					<input className="textfield" type={"text"} {...register("logoUrl")} />
				</LabeledField>
				<LabeledField label={t("license_text")} error={errors.licenseText?.message}>
					<textarea className="textfield" {...register("licenseText")} />
				</LabeledField>
				<LabeledField label={t("options")} error={errors.licenseText?.message}>
					<div className="flex flex-col">
						<span className="flex items-center gap-2">
							<input
								id={"selectable"}
								type={"checkbox"}
								className="checkbox"
								checked={selectable}
								onChange={() => {
									setValue("selectable", !selectable);
								}}
							/>
							<label htmlFor={"selectable"} className="text-sm font-semibold">
								{t("choosable")}
							</label>
							<QuestionMarkTooltip tooltipText={t("tooltip_choosable")} />
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"oerCompatible"}
								type={"checkbox"}
								className="checkbox"
								checked={oerCompatible}
								onChange={() => {
									setValue("oerCompatible", !oerCompatible);
								}}
							/>
							<label htmlFor={"oerCompatible"} className="text-sm font-semibold">
								{t("export_allowed")}
							</label>
							<QuestionMarkTooltip tooltipText={t("export_allowed_tooltip")} />
						</span>
						<span className="flex items-center gap-2">
							<input
								id={"defaultSuggestion"}
								type={"checkbox"}
								className="checkbox"
								checked={defaultSuggestion}
								onChange={() => {
									setValue("defaultSuggestion", !defaultSuggestion);
								}}
							/>
							<label htmlFor={"defaultSuggestion"} className="text-sm font-semibold">
								{t("standard_license")}
							</label>
							<QuestionMarkTooltip tooltipText={t("standard_license_tooltip")} />
						</span>
					</div>
				</LabeledField>
			</div>
		</section>
	);
}
