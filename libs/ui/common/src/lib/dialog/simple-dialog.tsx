import { CenteredContainer } from "@self-learning/ui/layouts";
import React, { useState } from "react";
import { Dialog, DialogActions } from "@self-learning/ui/common";

export type ButtonActions = "OK" | "CANCEL";

export const ButtonActions = {
	OK: "OK" as ButtonActions,
	CANCEL: "CANCEL" as ButtonActions
};

export function SimpleDialog({
	children,
	name,
	onClose
}: {
	children: React.ReactNode;
	name: string;
	onClose: (action: ButtonActions) => void;
}) {
	const [open, setOpen] = useState(true);

	const onDialogClose = (type?: ButtonActions) => {
		setOpen(false);
		onClose(type ?? ButtonActions.CANCEL);
	};

	if (!open) return null;
	return (
		<CenteredContainer>
			<Dialog
				style={{ height: "25vh", width: "30vw", overflow: "auto" }}
				title={name}
				onClose={() => {
					onDialogClose();
				}}
			>
				<CenteredContainer>{children}</CenteredContainer>
				<div className="mt-auto">
					<DialogActions onClose={onDialogClose}>
						<button
							className="btn-primary"
							onClick={() => onDialogClose(ButtonActions.OK)}
						>
							OK
						</button>
					</DialogActions>
				</div>
			</Dialog>
		</CenteredContainer>
	);
}
