import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

export function DropdownButton({
	title,
	backgroundColor,
	chevronColor,
	hover,
	children,
	position = "bottom"
}: {
	title: string;
	backgroundColor?: string;
	chevronColor?: string;
	hover?: string;
	position?: "top" | "bottom";
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

	// Determine the positioning classes based on the `position` prop.
	const positionClasses = position === "top" ? "bottom-full" : "top-full";

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
					{childrenArray[0]}
				</button>
			</div>
			{isOpen && (
				<div
					className={`absolute ${positionClasses} w-full overflow-auto bg-transparent shadow-md`}
					onClick={() => setIsOpen(false)}
				>
					{withoutFirst}
				</div>
			)}
		</div>
	);
}
