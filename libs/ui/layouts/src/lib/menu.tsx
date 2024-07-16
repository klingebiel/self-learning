import React, { Fragment, useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Transition } from "@headlessui/react";

export function TranslationButton() {
	const { i18n } = useTranslation();
	const [selectedLang, setSelectedLang] = useState<string>("");
	const langdic = {
		en: ["English", "\u{1F1EC}\u{1F1E7}"],
		de: ["Deutsch", "\u{1F1E9}\u{1F1EA}"] //{langdic[selectedLang][0]}
	};
	useEffect(() => {
		const localLang = localStorage.getItem("lang");
		if (localLang == null) {
			i18n.changeLanguage("en");
		} else {
			i18n.changeLanguage(localLang);
			setSelectedLang(localLang);
		}
	}, [i18n]);
	return (
		<Menu>
			<div>
				<Menu.Button className="flex items-center gap-1 rounded-full">
					<p className="hover:text-secondary">
						{selectedLang ? langdic[selectedLang][0] : "English"}
					</p>
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
				<Menu.Items
					style={{
						position: "absolute",
						bottom: "23px",
						minWidth: "10px",
						zIndex: "10"
					}}
					className="absolute rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
				>
					{Object.keys(langdic).map((lang: string, index: number): JSX.Element => {
						return (
							<div
								style={{
									margin: "3px"
								}}
								key={index}
								onClick={(): void => {
									i18n.changeLanguage(lang);
									setSelectedLang(lang);
									localStorage.setItem("lang", lang);
								}}
							>
								<Menu.Item as="div">
									{({ active }) => (
										<button
											className={`${
												active ? "bg-emerald-500 text-white" : ""
											} flex w-full items-center rounded-md px-1`}
										>
											<div style={{ minWidth: "70px" }}>
												<p>{langdic[lang][0]}</p>
											</div>
											<span role="img" aria-label="Flagge">
												{langdic[lang][1]}
											</span>
										</button>
									)}
								</Menu.Item>
							</div>
						);
					})}
				</Menu.Items>
			</Transition>
		</Menu>
	);
}
