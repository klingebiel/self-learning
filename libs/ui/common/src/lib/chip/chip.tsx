import { XMarkIcon } from "@heroicons/react/24/solid";
import { ImageOrPlaceholder } from "../image/image-placeholder";
import { TransparentDeleteButton } from "../button/delete-button";
import { useTranslation } from "react-i18next";

export function Chip({
	children,
	onRemove,
	displayImage,
	imgUrl
}: {
	children: React.ReactNode;
	onRemove?: () => void;
	displayImage: boolean;
	imgUrl?: string | null;
}) {
	const { t } = useTranslation();
	return (
		<li className="flex items-center rounded-lg border border-light-border bg-white text-sm">
			{displayImage && (
				<ImageOrPlaceholder
					src={imgUrl ?? undefined}
					className="h-12 w-12 shrink-0 rounded-l-lg object-cover"
				/>
			)}

			<span className="flex w-full flex-col px-4">{children}</span>
			<div className={"px-2"}>
				{onRemove && (
					<TransparentDeleteButton
						onDelete={onRemove}
						data-testid={"remove"}
						title={t("remove_author")}
					/>
				)}
			</div>
		</li>
	);
}
