import { SectionCard as DefaultSectionCard } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";

/**
 * Stacks sections vertically.
 *
 * `flex flex-col gap-32`
 */
export function Container({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-col gap-32">{children}</div>;
}

/**
 * A {@link SectionCard} with `relative` positioning. Stacks `children` vertically with `gap-8`.
 */
export function SectionCard({ children }: { children: React.ReactNode }) {
	return <DefaultSectionCard className="relative gap-8">{children}</DefaultSectionCard>;
}

/**
 * A container with restricted width that horizontally centers it's children.
 *
 * @example
 * <Form.MarkdownWithPreviewContainer>
 * 	<MarkdownField
 * 		content={value}
 * 		setValue={setValue}
 * 		minHeight="500px"
 * 	/>
 * </Form.MarkdownWithPreviewContainer>
 */
export function MarkdownWithPreviewContainer({ children }: { children: React.ReactNode }) {
	return <div className="mx-auto">{children}</div>;
}

/**
 * A {@link CenteredContainer} that displays the `title`, `button` and optionally some `specialButtons`,
 * that may be placed using absolute positioning.
 *
 * @example
 * <Form.Title
 * 	title={<span>Neuen <span className="text-emerald-600">Kurs</span> hinzufügen</span>}
 * 	button={
 * 		<button className="btn-primary h-fit w-fit" type="submit">
 * 			Speichern
 * 		</button>
 * 	}
 * 	specialButtons={
 * 		<button
 * 			type="button"
 * 			className="absolute bottom-16 text-sm font-semibold text-secondary"
 * 			onClick={() => setOpenAsJson(true)}
 * 		>
 * 			Als JSON bearbeiten
 * 		</button>
 * 	}
 * />
 */
export function Title({
	specialButtons,
	button,
	title
}: {
	specialButtons?: React.ReactNode;
	button: React.ReactNode;
	title: React.ReactNode;
}) {
	return (
		<CenteredContainer className="relative flex justify-between gap-16 pt-16 pb-24">
			<h1 className="text-3xl sm:text-5xl">{title}</h1>
			{button}
			{specialButtons}
		</CenteredContainer>
	);
}

export function SidebarSection({ children }: { children: React.ReactNode }) {
	return (
		<section
			className={`ml-3 flex flex-col gap-4 border-b border-light-border py-4 last:border-b-0`}
		>
			{children}
		</section>
	);
}

export function SidebarSectionTitle({
	children,
	title,
	subtitle
}: {
	title: string;
	subtitle: string;
	children?: React.ReactNode;
}) {
	return (
		<div>
			<div className={"flex items-center justify-between"}>
				<h2 className="text-xl">{title}</h2>

				{children && <div className="flex-shrink-0">{children}</div>}
			</div>
			<span className="text-sm text-light">{subtitle}</span>
		</div>
	);
}
