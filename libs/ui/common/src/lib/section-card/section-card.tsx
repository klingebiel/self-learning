import { ReactNode } from "react";

export function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={`card relative grid w-full items-start rounded-lg border border-light-border bg-white ${
				className ?? ""
			}`}
		>
			{children}
		</div>
	);
}

export function SectionCardHeader({
	title,
	subtitle
}: {
	title: string;
	subtitle?: string | null;
}) {
	return (
		<div className="mb-8 grid items-start gap-2">
			<h2 className="text-2xl">{title}</h2>
			{subtitle && <span className="text-light">{subtitle}</span>}
		</div>
	);
}

export function SectionHeader({
	title,
	subtitle,
	button
}: {
	title: string;
	subtitle?: string | null;
	button?: ReactNode;
}) {
	return (
		<div className="mb-8 mt-4">
			<div className="flex items-center gap-4">
				<h2 className="flex-grow text-4xl">{title}</h2>

				{button && <div className="mr-0.5">{button}</div>}
			</div>
			{subtitle && <p className="mt-2 text-light">{subtitle}</p>}{" "}
		</div>
	);
}
