import React from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { DefaultButton } from "./default-button";
import { useTranslation } from "react-i18next";

export function EditButton({
	onEdit,
	title,
	children
}: {
	onEdit: () => void;
	title?: string;
	children?: React.ReactNode;
}) {
	const { t } = useTranslation();
	return (
		<DefaultButton onClick={onEdit} title={title ? title : t("edit")}>
			{children ? (
				<div className="flex items-center space-x-2">
					<PencilIcon className="h-5 w-5 text-gray-500" />
					<div>{children}</div>
				</div>
			) : (
				<PencilIcon className="h-5 w-5 text-gray-500" />
			)}
		</DefaultButton>
	);
}
