import {
	AcademicCapIcon,
	ArrowLeftOnRectangleIcon,
	UserIcon,
	Bars4Icon,
	XMarkIcon
} from "@heroicons/react/24/outline";
import { ChevronDownIcon, StarIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirectToLogin, redirectToLogout } from "./redirect-to-login";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { SearchBar } from "./search-bar";
import { useTranslation } from "react-i18next";

export function Navbar() {
	const session = useSession();
	const user = session.data?.user;
	const { t } = useTranslation();

	// List with all routes accessible by the User
	const navigation = [
		{ name: t("overview"), href: "/overview" },
		{ name: t("subjects"), href: "/subjects" }
	];

	if (user?.role === "ADMIN") {
		navigation.push({ name: t("admin_area"), href: "/admin" });
	}

	return (
		<Disclosure
			as="nav"
			className="sticky top-0 z-20 w-full border-b border-b-gray-200 bg-white"
		>
			{({ open }) => (
				<>
					<div className="mx-auto px-2 lg:px-6 xl:px-8">
						<div className="relative flex h-16 items-center justify-between">
							<div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
								{/* Mobile menu button*/}
								<Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
									<span className="sr-only">{t("open_menu")}</span>
									{open ? (
										<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
									) : (
										<Bars4Icon className="block h-6 w-6" aria-hidden="true" />
									)}
								</Disclosure.Button>
							</div>
							<div className="flex flex-1 items-center justify-center lg:items-stretch lg:justify-start">
								<div className="flex flex-shrink-0 items-center">
									<Link href="/" className="flex items-center gap-4">
										<div className="rounded-full bg-secondary p-1">
											<AcademicCapIcon className="h-8 shrink-0 text-white" />
										</div>
										<div className="hidden w-0 flex-col lg:flex lg:w-fit">
											<span className="whitespace-nowrap text-sm text-light">
												Universität Hildesheim
											</span>
											<span className="whitespace-nowrap font-bold text-secondary">
												SELF-le@rning
											</span>
										</div>
									</Link>
								</div>
								<div className="hidden lg:ml-6 lg:block">
									{user && (
										<div className="flex h-full items-center space-x-4 px-1 text-sm font-medium">
											{navigation.map(item => (
												<Link
													className="hover:text-gray-500"
													key={item.name}
													href={item.href}
												>
													{item.name}
												</Link>
											))}
										</div>
									)}
								</div>
							</div>
							{user && <SearchBar />}
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0">
								{/* Profile dropdown */}
								{!user ? (
									<button
										className="text-w rounded-lg bg-emerald-500 px-8 py-2 font-semibold text-white"
										onClick={redirectToLogin}
									>
										Login
									</button>
								) : (
									<div className="flex items-center gap-1 xl:gap-4">
										{user.role === "ADMIN" && (
											<span title="Admin">
												<StarIcon className="h-5 text-secondary" />
											</span>
										)}
										<span className="invisible w-0 text-sm lg:visible lg:w-fit">
											{user.name}
										</span>
										<NavbarDropdownMenu
											avatarUrl={user.avatarUrl}
											signOut={redirectToLogout}
										/>
									</div>
								)}
							</div>
						</div>
					</div>

					<Disclosure.Panel className="lg:hidden">
						<div className="space-y-1 px-2 pb-3 pt-2">
							{navigation.map(item => (
								<Disclosure.Button
									key={item.name}
									as="a"
									href={item.href}
									className="block rounded-md px-3 py-2 text-base font-medium hover:text-gray-500"
								>
									{item.name}
								</Disclosure.Button>
							))}
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}

export function NavbarDropdownMenu({
	signOut,
	avatarUrl
}: {
	avatarUrl?: string | null;
	signOut: () => void;
}) {
	const { t } = useTranslation();
	return (
		<Menu as="div" className="relative ml-1 xl:ml-3">
			<div>
				<Menu.Button className="flex items-center gap-1 rounded-full text-sm">
					<span className="sr-only">{t("open_user_menu")}</span>
					{avatarUrl ? (
						<img
							className="h-[42px] w-[42px] rounded-full object-cover object-top"
							alt="Avatar"
							src={avatarUrl}
							width={42}
							height={42}
						></img>
					) : (
						<div className="h-[42px] w-[42px] rounded-full bg-gray-200"></div>
					)}
					<ChevronDownIcon className="h-6 text-gray-400" />
				</Menu.Button>
			</div>
			<Transition
				as={Fragment}
				enter="transition ease-out duration-100"
				enterFrom="transform opacity-0 scale-95"
				enterTo="transform opacity-100 scale-100"
				leave="transition ease-in duration-75"
				leaveFrom="transform opacity-100 scale-100"
				leaveTo="transform opacity-0 scale-95"
			>
				<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
					<Menu.Item as="div" className="p-1">
						{({ active }) => (
							<Link
								href="/overview"
								className={`${
									active ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<UserIcon className="h-5" />
								<span>{t("overview")}</span>
							</Link>
						)}
					</Menu.Item>
					<Menu.Item as="div" className="p-1">
						{({ active }) => (
							<button
								onClick={signOut}
								className={`${
									active ? "bg-emerald-500 text-white" : ""
								} flex w-full items-center gap-2 rounded-md px-2 py-2`}
							>
								<ArrowLeftOnRectangleIcon className="h-5" />
								<span>{t("logout")}</span>
							</button>
						)}
					</Menu.Item>
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
