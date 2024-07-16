import { Dialog as HeadlessDialog } from "@headlessui/react";
import { CSSProperties, ReactNode } from "react";
import { DefaultButton } from "../button/default-button";
import { useTranslation } from "react-i18next";

export type OnDialogCloseFn<T> = (result?: T) => void;

export function Dialog<TResult>({
	onClose,
	children,
	title,
	style,
	className
}: {
	title: string;
	onClose: OnDialogCloseFn<TResult>;
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
}) {
	return (
		<HeadlessDialog open={true} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full items-center place-self-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className={`relative mx-auto flex h-fit flex-col overflow-hidden rounded-lg bg-white p-8 ${
							className ?? ""
						}`}
						style={style ?? { minWidth: 624, maxHeight: "80vh" }}
						data-testid="Dialog"
					>
						<HeadlessDialog.Title className="mb-8 text-2xl">
							{title}
						</HeadlessDialog.Title>
						{children}
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}
export function DialogWithReactNodeTitle<TResult>({
	onClose,
	children,
	title,
	style,
	className
}: {
	title: ReactNode;
	onClose: OnDialogCloseFn<TResult>;
	children: React.ReactNode;
	style?: CSSProperties;
	className?: string;
}) {
	return (
		<HeadlessDialog open={true} onClose={() => onClose(undefined)} className="relative z-50">
			{/* The backdrop, rendered as a fixed sibling to the panel container */}
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			{/* Full-screen scrollable container */}
			<div className="fixed inset-0 flex items-center justify-center">
				{/* Container to center the panel */}
				<div className="absolute flex min-h-full items-center place-self-center">
					{/* The actual dialog panel  */}
					<HeadlessDialog.Panel
						className={`relative mx-auto flex h-fit flex-col overflow-hidden rounded-lg bg-white p-8 ${
							className ?? ""
						}`}
						style={style ?? { minWidth: 624, maxHeight: "80vh" }}
						data-testid="Dialog"
					>
						<HeadlessDialog.Title className="mb-8 text-2xl">
							{title}
						</HeadlessDialog.Title>
						{children}
					</HeadlessDialog.Panel>
				</div>
			</div>
		</HeadlessDialog>
	);
}

export function DialogActions({
	onClose,
	children
}: {
	/** Function that will be called with `undefined` when the `Cancel` button is clicked. */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClose: OnDialogCloseFn<any>;
	/** Should include the call to action button.  */
	children?: React.ReactNode;
}) {
	const { t } = useTranslation();
	return (
		<div className="pointer-events-auto mt-8 flex justify-end gap-2">
			<DefaultButton onClick={() => onClose(undefined)}>
				<span className={"text-gray-600"}>{t("cancel")}</span>
			</DefaultButton>
			{children}
		</div>
	);
}
