import { Dialog } from "@headlessui/react";
import { EditorField } from "@self-learning/ui/forms";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function JsonEditorDialog<T>({
	initialValue,
	isOpen,
	setIsOpen,
	onClose
}: {
	initialValue: T;
	isOpen: boolean;
	setIsOpen: (bool: boolean) => void;
	onClose: (value: T) => void;
}) {
	const { getValues } = useFormContext();
	const [value, setValue] = useState(JSON.stringify(getValues()));
	const [error, setError] = useState<string | null>(null);

	function closeWithReturn() {
		try {
			const parsedJson = JSON.parse(value);
			onClose(parsedJson);
			setIsOpen(false);
		} catch (e) {
			setError("JSON-Format ist ungültig.");
		}
	}

	return (
		<Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				{/* Container to center the panel */}
				<div className="flex min-h-full items-center justify-center">
					{/* The actual dialog panel  */}
					<Dialog.Panel className="mx-auto w-[50vw] rounded bg-white px-8 pb-8">
						<Dialog.Title className="py-8 text-xl">Als JSON bearbeiten</Dialog.Title>

						{error && <div className="pb-4 text-red-500">{error}</div>}

						<EditorField
							label="JSON"
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
								Übernehmen
							</button>

							<button
								type="button"
								className="btn-stroked w-fit"
								onClick={() => setIsOpen(false)}
							>
								Abbrechen
							</button>
						</div>
					</Dialog.Panel>
				</div>
			</div>
		</Dialog>
	);
}