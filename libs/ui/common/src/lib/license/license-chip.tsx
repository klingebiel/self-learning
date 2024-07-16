import { ImageOrPlaceholder } from "../image/image-placeholder";
import Link from "next/link";
import { useState } from "react";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { DialogWithReactNodeTitle } from "../dialog/dialog";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { useTranslation } from "react-i18next";

export function LicenseChip({
	name,
	description,
	imgUrl,
	url
}: {
	name: string;
	imgUrl?: string;
	description?: string;
	url?: string;
}) {
	const { t } = useTranslation();
	const [openModal, setOpenModal] = useState(false);
	const isSquare = !imgUrl;

	// const defaultLogoUrl = "/assets/images/placeholder.svg";
	// TODO receive default URL from minio/DB
	const defaultLogoUrl = "";
	return (
		<div>
			<Link
				href={url || "#"}
				onClick={e => {
					if (!url) {
						e.preventDefault();
						setOpenModal(true);
					}
				}}
				className={`flex items-center gap-4 rounded-lg border border-light-border bg-white
						${isSquare ? "pr-4" : ""} text-sm`}
				data-testid="author"
				style={url ? {} : { cursor: "pointer" }}
			>
				<ImageOrPlaceholder
					src={imgUrl ?? defaultLogoUrl}
					className={`h-10 ${isSquare ? "w-10" : "w-30"} rounded-l-lg object-cover`}
				/>
				{isSquare && <span className="font-medium hover:text-secondary">{name}</span>}
			</Link>
			{openModal && (
				<LicenseViewModal
					onClose={() => {
						setOpenModal(false);
					}}
					description={description ?? t("missing_license_description")}
					name={name}
					logoUrl={imgUrl ?? defaultLogoUrl}
				/>
			)}
		</div>
	);
}

export function LicenseViewModal({
	description,
	name,
	logoUrl,
	onClose
}: {
	description: string;
	name: string;
	logoUrl: string;
	onClose: () => void;
}) {
	const [open, setOpen] = useState(true);

	if (!open) return null;
	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={<LicenseViewHeader name={name} logoUrl={logoUrl} />}
				onClose={() => {
					setOpen(false);
					onClose();
				}}
			>
				<CenteredContainer>
					<MarkdownViewer content={description} />
				</CenteredContainer>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}

function LicenseViewHeader({ name, logoUrl }: { name: string; logoUrl: string }) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-4">
				<ImageOrPlaceholder
					src={logoUrl}
					className={`w-30 m-0 h-10 rounded-lg object-cover`}
				/>
				<span className="text-3xl font-semibold">{name}</span>
			</div>
		</div>
	);
}
