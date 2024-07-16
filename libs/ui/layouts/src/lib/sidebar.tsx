import {
	ClipboardDocumentListIcon,
	DocumentMagnifyingGlassIcon,
	HomeIcon
} from "@heroicons/react/24/outline";
import { AcademicCapIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function Sidebar({
	header,
	content,
	footer
}: {
	header: ReactNode;
	content: ReactNode;
	footer: ReactNode;
}) {
	return (
		<div className="fixed top-0 left-0 z-10 flex h-full w-full flex-col overflow-hidden bg-white sm:w-64">
			{header}
			<ScrollableContent>{content}</ScrollableContent>
			{footer}
		</div>
	);
}

export function DefaultSidebar({ setOpen }: { setOpen: (open: boolean) => void }) {
	return (
		<Sidebar
			header={<SidebarHeader setOpen={setOpen} />}
			content={<SidebarLinks />}
			footer={<SidebarFooter />}
		/>
	);
}

function SidebarLink({
	href,
	text,
	icon,
	isActive
}: {
	href: string;
	text: string;
	icon: JSX.Element;
	isActive: boolean;
}) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-4 rounded py-2 px-2 ${
				isActive ? "bg-secondary text-white" : "text-light hover:bg-indigo-50"
			}`}
		>
			{icon}
			<span className={`text-sm ${isActive && "font-semibold"}`}>{text}</span>
		</Link>
	);
}

function SidebarHeader({ setOpen }: { setOpen: (open: boolean) => void }) {
	return (
		<div className="to flex justify-between border-b border-light-border p-4">
			<Link href="/" className="flex items-center gap-4">
				<AcademicCapIcon height="48" className="text-secondary" />
				<span className="text-lg font-semibold">SELF LEARNING</span>
			</Link>
			<button
				className="absolute right-0 top-0 text-slate-900 hover:text-white"
				title="Close Sidebar"
				onClick={() => setOpen(false)}
			>
				<XMarkIcon height="24" />
			</button>
		</div>
	);
}

function ScrollableContent({ children }: PropsWithChildren<unknown>) {
	return <div className="Sidebar scroll flex-grow overflow-auto">{children}</div>;
}

function SidebarLinks() {
	const { t } = useTranslation();
	const router = useRouter();

	return (
		<div className="grid gap-2 px-2 py-2">
			<SidebarLink
				isActive={router.route === "/"}
				href="/"
				text={t("homepage")}
				icon={<HomeIcon height="24" />}
			/>
			<SidebarLink
				isActive={router.route === "/courses"}
				href="/courses"
				text={t("lesson_contents")}
				icon={<DocumentMagnifyingGlassIcon height="24" />}
			/>
			<SidebarLink
				isActive={router.route === "/lessons/[lessonSlug]"}
				href="/todo"
				text={t("my_learn_plan")}
				icon={<ClipboardDocumentListIcon height="24" />}
			/>
		</div>
	);
}

function SidebarFooter() {
	const session = useSession();

	return (
		<div className="flex flex-col border-t border-light-border">
			<div className="flex py-4">
				{session.data?.user?.name && <UserInformation name={session.data.user.name} />}
			</div>
		</div>
	);
}

function UserInformation({ name }: { name: string }) {
	return (
		<div className="flex items-center gap-4 px-4">
			<div className="flex aspect-square h-10 rounded-full bg-gradient-to-br from-purple-600 to-orange-500">
				<span className="m-auto text-white">
					{name[0]}
					{name[1]}
				</span>
			</div>
			<div className="flex flex-col gap-1">
				<span className="text-sm font-medium">{name}</span>
				<span className="text-xs text-slate-400">Wirtschaftsinformatik</span>
			</div>
		</div>
	);
}
