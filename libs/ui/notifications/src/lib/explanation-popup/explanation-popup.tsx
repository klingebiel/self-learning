// import React, { useState, useEffect } from "react";
// import "./fading-help-text.module.css";

// interface ExplanationPopupProps {
// 	children: React.ReactNode;
// 	message: string;
// 	duration?: number; // Duration in milliseconds
// }

// export const ExplanationPopup: React.FC<ExplanationPopupProps> = ({
// 	children,
// 	message,
// 	duration = 5000
// }) => {
// 	const [visible, setVisible] = useState(true);

// 	useEffect(() => {
// 		const timer = setTimeout(() => {
// 			setVisible(false);
// 		}, duration);

// 		return () => clearTimeout(timer);
// 	}, [duration]);

// 	const handleClick = () => {
// 		setVisible(false);
// 	};

// 	return (
// 		<div className="relative inline-block" onClick={handleClick}>
// 			{children}
// 			{visible && <div className="explanation-popup">{message}</div>}
// 		</div>
// 	);
// };
import React, { useState } from "react";
import styles from "./explanation-popup.module.css";

interface ExplanationPopupProps {
	children: React.ReactNode;
	message: string;
	backgroundColor?: string;
	textColor?: string;
	position?: "top" | "bottom" | "left" | "right";
}

export const ExplanationPopup: React.FC<ExplanationPopupProps> = ({
	children,
	message,
	backgroundColor = "#333",
	textColor = "#fff",
	position = "top"
}) => {
	const [visible, setVisible] = useState(true);

	const handleClick = () => {
		setVisible(false);
	};

	return (
		<div className="relative inline-block" onClick={handleClick}>
			{children}
			{visible && (
				<div
					className={`${styles.explanationPopup} ${styles[`explanationPopup${position.charAt(0).toUpperCase() + position.slice(1)}`]}`}
					style={{ backgroundColor, color: textColor }}
				>
					{message}
				</div>
			)}
		</div>
	);
};
