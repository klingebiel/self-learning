import React, { ReactNode } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { DropdownButton } from "./dropdown-button";
import { useTranslation } from "react-i18next";

export function AddButton({
	onAdd,
	title,
	size,
	label,
	additionalClassNames
}: {
	onAdd: () => void;
	title: string;
	size?: string;
	label?: ReactNode;
	additionalClassNames?: string;
}) {
	const { t } = useTranslation();
	return (
		<button
			type="button"
			onClick={onAdd}
			title={title || t("add")}
			className={`btn-primary rounded-md border border-transparent hover:bg-emerald-700 ${
				size ? size : "px-4 py-2"
			} ${additionalClassNames}`}
		>
			{label ? (
				<div className="flex items-center space-x-2">
					<PlusIcon className="h-5 w-5" />
					<div>{label}</div>
				</div>
			) : (
				<PlusIcon className="h-5 w-5" />
			)}
		</button>
	);
}

export function AddDropDownButton({ label, children }: { label: string; children: ReactNode }) {
	const { t } = useTranslation();
	return (
		<DropdownButton
			title={t("add_task_type")}
			backgroundColor={"btn-primary"}
			hover={"hover:bg-emerald-700"}
			chevronColor={"text-white"}
		>
			<span className={"text-white"}>{label}</span>
			{children}
		</DropdownButton>
	);
}
