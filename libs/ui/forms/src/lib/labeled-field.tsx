import { PropsWithChildren, ReactNode } from "react";

export function LabeledField({
	children,
	label,
	htmlFor,
	error,
	optional,
	disabled,
	button
}: PropsWithChildren<{
	label: string;
	htmlFor?: string;
	error?: string;
	optional?: boolean;
	disabled?: boolean;
	button?: ReactNode;
}>) {
	return (
		<fieldset
			className={`relative flex w-full flex-col gap-1 ${
				disabled ? "" /*"pointer-events-none opacity-50"*/ : ""
			}`}
			disabled={disabled}
		>
			<label htmlFor={htmlFor}>
				<div className={"flex items-center justify-between"}>
					<span className="text-sm font-semibold">{label}</span>
					{button ? button : null}
				</div>
				{optional && <span className="px-2 text-xs text-light">Optional</span>}
				{error && <span className="px-4 text-xs text-red-500">{error}</span>}
			</label>
			{children}
		</fieldset>
	);
}

export function FieldError({ error }: { error?: string | null }) {
	if (error) {
		return <p className="absolute left-0 -bottom-5 text-xs text-red-500">{error}</p>;
	}

	return null;
}

export function FieldHint({ children }: { children?: ReactNode }) {
	return <p className="px-2 text-xs text-light">{children}</p>;
}
