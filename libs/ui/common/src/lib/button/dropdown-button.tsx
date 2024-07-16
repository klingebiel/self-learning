import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

export function DropdownButton({
	title,
	backgroundColor,
	chevronColor,
	hover,
	children
}: {
	title: string;
	backgroundColor: string;
	chevronColor: string;
	hover: string;
	children: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const childrenArray = React.Children.toArray(children);
	const withoutFirst = childrenArray.slice(1);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
		}
	}

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<div className={"inline-flex items-center justify-center"}>
				<button
					type="button"
					onClick={event => {
						event?.stopPropagation();
						setIsOpen(!isOpen);
					}}
					title={title}
					className={`${backgroundColor} ${hover}`}
				>
					{isOpen ? (
						<ChevronUpIcon className={`h-5 w-5 ${chevronColor ? chevronColor : ""}`} />
					) : (
						<ChevronDownIcon
							className={`h-5 w-5 ${chevronColor ? chevronColor : ""}`}
						/>
					)}
					{/*First Child Prop is used to Display the Button Text*/}
					{childrenArray[0]}
				</button>
			</div>
			{isOpen && (
				<div
					className="absolute w-full overflow-auto bg-transparent shadow-md"
					onClick={() => setIsOpen(false)}
				>
					{withoutFirst}
				</div>
			)}
		</div>
	);
}
