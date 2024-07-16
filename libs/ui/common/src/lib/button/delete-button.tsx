import React, { ReactNode } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

export function DeleteButton({
	onDelete,
	title,
	label,
	additionalClassNames
}: {
	onDelete: () => void;
	title: string;
	label?: ReactNode;
	additionalClassNames?: string;
}) {
	const { t } = useTranslation();
	return (
		<button
			type="button"
			onClick={onDelete}
			title={title ? title : t("delete")}
			className={`rounded-md border border-transparent bg-red-500 px-4 py-2 hover:bg-red-600 ${additionalClassNames}`}
		>
			{label ? label : <TrashIcon className="h-5 w-5" />}
		</button>
	);
}

export function TransparentDeleteButton({
	onDelete,
	title,
	label,
	additionalClassNames
}: {
	onDelete: () => void;
	title: string;
	label?: ReactNode;
	additionalClassNames?: string;
}) {
	return (
		<button
			type="button"
			onClick={onDelete}
			title={title}
			className={`rounded-md border border-transparent bg-transparent ${additionalClassNames}`}
		>
			{label || <XMarkIcon className="h-5 w-5 text-gray-600 hover:text-red-600" />}
		</button>
	);
}
