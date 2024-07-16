import { rehypePlugins, remarkPlugins } from "@self-learning/markdown";
import { Dialog, DialogActions, EditButton, OnDialogCloseFn } from "@self-learning/ui/common";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EditorField } from "./editor";
import { AssetPickerButton } from "./upload";
import { useTranslation } from "react-i18next";

export function MarkdownField({
	content,
	setValue,
	label,
	inline,
	placeholder
}: {
	label?: string;
	content: string | undefined;
	setValue: (v: string | undefined) => void;
	inline?: boolean;
	placeholder?: string;
}) {
	const { t } = useTranslation();
	const [openEditor, setOpenEditor] = useState(false);

	return (
		<div className={inline ? "flex flex-col gap-1" : ""}>
			{!inline && (
				<div className="mb-2 flex items-end justify-end">
					<EditButton onEdit={() => setOpenEditor(true)} title={t("edit_description")}>
						<span className={"text-gray-600"}>{t("edit")}</span>
					</EditButton>
				</div>
			)}

			<div
				className={
					"cursor-pointer rounded-lg border border-light-border bg-white " +
					(inline ? "p-2" : "flex p-4")
				}
				style={{ minHeight: 32 }}
				onClick={() => setOpenEditor(true)}
			>
				<div className={"prose prose-emerald max-w-full" + (inline && " text-sm")}>
					{content !== "" ? (
						<ReactMarkdown
							linkTarget="_blank"
							remarkPlugins={remarkPlugins}
							rehypePlugins={rehypePlugins}
						>
							{content ?? ""}
						</ReactMarkdown>
					) : (
						<div className="text-gray-400">{placeholder}</div>
					)}
				</div>
			</div>

			{openEditor && (
				<MarkdownEditorDialog
					initialValue={content ?? ""}
					title={t("edit")}
					onClose={changes => {
						setOpenEditor(false);
						if (changes !== undefined) {
							setValue(changes);
						}
					}}
				/>
			)}
		</div>
	);
}

export function MarkdownEditorDialog({
	title,
	initialValue,
	onClose
}: {
	title: string;
	initialValue: string;
	onClose: OnDialogCloseFn<string>;
}) {
	const { t } = useTranslation();
	const [value, setValue] = useState(initialValue);

	return (
		<Dialog
			style={{ height: "85vh", width: "85vw" }}
			onClose={() => window.confirm(t("continue_without_changes")) && onClose(undefined)}
			title={title}
		>
			<div className="grid h-full grid-cols-2 items-start gap-8 overflow-hidden pt-4">
				<div className="flex h-full w-full flex-col gap-2">
					<label className="text-sm font-semibold">Markdown</label>
					<EditorField
						language="markdown"
						onChange={setValue as any}
						value={value}
						height={"100%"}
					/>
				</div>

				<div className="flex h-full w-full flex-col gap-2 overflow-auto">
					<span className="relative flex justify-between">
						<label className="text-sm font-semibold">Preview</label>
						<div className="absolute right-0 -top-4 flex gap-4">
							<AssetPickerButton
								copyToClipboard={true}
								onClose={() => {
									/** NOOP */
								}}
							/>
						</div>
					</span>
					<div className="relative flex h-full w-full grow overflow-auto border border-light-border bg-white p-4">
						<div className="prose prose-emerald w-full">
							<ReactMarkdown
								linkTarget="_blank"
								remarkPlugins={remarkPlugins}
								rehypePlugins={rehypePlugins}
							>
								{value ?? ""}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>

			<DialogActions onClose={onClose}>
				<button type="button" className="btn-primary" onClick={() => onClose(value)}>
					{t("save")}
				</button>
			</DialogActions>
		</Dialog>
	);
}

/**
 * Client-side Markdown renderer.
 *
 * If possible, prefer server-side rendering instead of using this component.
 */
export function MarkdownViewer({ content }: { content: string }) {
	return (
		<ReactMarkdown
			linkTarget="_blank"
			remarkPlugins={remarkPlugins}
			rehypePlugins={rehypePlugins}
		>
			{content ?? ""}
		</ReactMarkdown>
	);
}
