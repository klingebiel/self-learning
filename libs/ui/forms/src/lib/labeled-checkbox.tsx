import React from "react";

export function LabeledCheckbox({
	checked,
	onChange,
	label
}: {
	checked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label?: string;
}) {
	return (
		<label className={"text-sm"}>
			<span className={"mr-4"}>{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={onChange}
				className={"secondary form-checkbox rounded text-secondary focus:ring-secondary"}
			/>
		</label>
	);
}
