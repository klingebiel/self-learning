import { Tab as HeadlessTab } from "@headlessui/react";
import { Fragment, ReactNode } from "react";
import { TransparentDeleteButton } from "../button/delete-button";

export function Tabs({
	children,
	selectedIndex,
	onChange
}: {
	children: ReactNode;
	selectedIndex: number | undefined;
	onChange: (index: number) => void;
}) {
	return (
		<HeadlessTab.Group selectedIndex={selectedIndex} onChange={onChange}>
			<HeadlessTab.List className="flex w-full flex-wrap gap-4 border-b border-light-border">
				{children}
			</HeadlessTab.List>
		</HeadlessTab.Group>
	);
}

export function Tab({ children }: { children: ReactNode }) {
	return (
		<HeadlessTab as={Fragment}>
			{({ selected }) => (
				<li className="flex min-w-[128px] cursor-pointer flex-col gap-1 focus:ring-0 focus-visible:outline-secondary">
					<span
						className={`mx-auto px-2 py-2 font-semibold ${
							selected ? "text-secondary" : "text-light"
						}`}
					>
						{children}
					</span>

					<div className="flex w-full flex-row gap-2">
						<span
							className={
								selected
									? "h-[2px] flex-1 bg-secondary"
									: "h-[2px] flex-1 bg-gray-400"
							}
						></span>
					</div>
				</li>
			)}
		</HeadlessTab>
	);
}

export function RemovableTab({
	children,
	onRemove
}: {
	onRemove: () => void;
	children: ReactNode;
}) {
	return (
		<Tab>
			<span className="flex items-end gap-4 hover:text-secondary">
				<span>{children}</span>
				<TransparentDeleteButton
					onDelete={onRemove}
					title="Entfernen"
					additionalClassNames="flex items-center"
				/>
			</span>
		</Tab>
	);
}

export function VerticalTabs({
	children,
	selectedIndex,
	onChange
}: {
	children: ReactNode;
	selectedIndex: number | undefined;
	onChange: (index: number) => void;
}) {
	return (
		<HeadlessTab.Group vertical={true} selectedIndex={selectedIndex} onChange={onChange}>
			<HeadlessTab.List className="flex flex-col gap-2">{children}</HeadlessTab.List>
		</HeadlessTab.Group>
	);
}

export function VerticalTab({ children }: { children: ReactNode }) {
	return (
		<HeadlessTab as={Fragment}>
			{({ selected }) => (
				<li className="grid grid-cols-[4px_1fr] gap-2">
					{selected && (
						<span className="flex h-full w-[4px] rounded-lg bg-secondary"></span>
					)}
					{!selected && <span></span>}
					<button
						type="button"
						className={`w-fit py-1 focus:ring-0 focus-visible:outline-secondary ${
							selected ? "font-semibold text-secondary" : "text-light"
						}`}
					>
						{children}
					</button>
				</li>
			)}
		</HeadlessTab>
	);
}
