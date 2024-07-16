import { Dialog } from "@headlessui/react";
import { EditorField } from "@self-learning/ui/forms";
import { useMemo, useState } from "react";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { ZodSchema } from "zod";
import { DefaultButton } from "@self-learning/ui/common";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export function JsonEditorDialog<T>({
	onClose,
	validationSchema
}: {
	validationSchema?: ZodSchema;
	onClose: (value: T | undefined) => void;
}) {
	const { getValues } = useFormContext();
	const [value, setValue] = useState(JSON.stringify(getValues()));
	const [error, setError] = useState<string | null>(null);

	function closeWithReturn() {
		try {
			const parsedJson = JSON.parse(value);

			if (validationSchema) {
				const validation = validationSchema.safeParse(parsedJson);

				if (!validation.success) {
					setError(validation.error.message);
					return;
				}
			}

			onClose(parsedJson);
		} catch (e) {
			setError("JSON-Format ist ungültig.");
		}
	}

	return (
		<Dialog
			open={true}
			onClose={() => window.confirm(t("continue_without_changes")) && onClose(undefined)}
			className="relative z-50"
		>
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="flex min-h-full items-center justify-center">
					{/* The actual dialog panel  */}
					<Dialog.Panel className="mx-auto w-[50vw] rounded bg-white px-8 pb-8">
						<Dialog.Title className="py-8 text-xl">{t("edit_as_json")}</Dialog.Title>

						{error && (
							<div className="mb-8 max-h-32 overflow-auto">
								<pre className="rounded-lg bg-red-50 p-4 pb-4 text-xs text-red-500">
									{error}
								</pre>
							</div>
						)}

						<EditorField
							language="json"
							value={value}
							height="60vh"
							onChange={value => setValue(value ?? "{}")}
						/>

						<div className="mt-8 flex gap-4">
							<button
								type="button"
								className="btn-primary  w-fit"
								onClick={closeWithReturn}
							>
								{t("save")}
							</button>

							<button
								type="button"
								className="btn-stroked w-fit"
								onClick={() => onClose(undefined)}
							>
								{t("cancel")}
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</div>
		</Dialog>
	);
}

function useJsonEditor(form: UseFormReturn) {
	const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);

	return useMemo(() => {
		return {
			isJsonEditorOpen,
			openJsonEditor: () => setIsJsonEditorOpen(true),
			onCloseJsonEditor: (value?: unknown) => {
				if (value) {
					form.reset(value);
				}

				setIsJsonEditorOpen(false);
			}
		};
	}, [form, isJsonEditorOpen, setIsJsonEditorOpen]);
}

/**
 * Provides a `button` that opens the surrounding form in {@link JsonEditorDialog}.
 * Must be nested inside a `FormProvider` (react-hook-form).
 *
 * @example
 * const form = useForm();
 *
 * <FormProvider {...form}>
 *  	<JsonEditorButton />
 * </FormProvider>
 */
export function OpenAsJsonButton({
	validationSchema,
	form
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	form: UseFormReturn<any>;
	validationSchema?: ZodSchema;
}) {
	const { t } = useTranslation();
	const { isJsonEditorOpen, openJsonEditor, onCloseJsonEditor } = useJsonEditor(form);

	return (
		<DefaultButton onClick={openJsonEditor}>
			<span className={"text-gray-600"}>{t("edit_as_json")}</span>
			{isJsonEditorOpen && (
				<JsonEditorDialog onClose={onCloseJsonEditor} validationSchema={validationSchema} />
			)}
		</DefaultButton>
	);
}
