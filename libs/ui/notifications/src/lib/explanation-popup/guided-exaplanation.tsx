import React from "react";
import { ExplanationPopup } from "./explanation-popup";
import styles from "./guided-explanation.module.css";

export function GuidedExplanation({
	message,
	children
}: {
	message: string;
	children: React.ReactNode;
}) {
	return (
		<div className={styles.guidedExplanationContainer}>
			<ExplanationPopup message={message}>{children}</ExplanationPopup>
		</div>
	);
}
