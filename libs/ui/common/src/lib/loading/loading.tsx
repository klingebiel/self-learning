import { showToast } from "../toast/toast";
import { useCountdownSeconds } from "../timer/timer";
import { useTranslation } from "react-i18next";

export function LoadingBox({
	height,
	children
}: {
	height?: string | number;
	children?: React.ReactNode;
}) {
	return (
		<div
			style={{ height: height ?? 500 }}
			className="h-full animate-pulse rounded-lg bg-gray-100"
		>
			{children ? (
				children
			) : (
				<div className="ml-10 mt-4 flex flex-col ">
					<div className="mb-4 h-6 w-3/4 rounded bg-gray-300"></div>
					<div className="space-y-4">
						<div className="h-5 w-5/6 rounded bg-gray-300"></div>
						<div className="h-5 w-4/6 rounded bg-gray-300"></div>
						<div className="h-5 w-1/2 rounded bg-gray-300"></div>
					</div>
				</div>
			)}
		</div>
	);
}

export function LoadingCircle({ className }: { className?: string }) {
	return (
		<div
			className={`inline-block ${
				className ?? ""
			} animate-spin rounded-full border-4 border-solid border-current border-t-transparent`}
			role="status"
		/>
	);
}

/**
 * Wrapper for a loading circle in the middle of the screen that will block other content.
 * @returns
 */
export function BlockingLoadingCircle({
	timeout,
	errorMsg
}: {
	timeout?: number;
	errorMsg?: string;
}) {
	const timeLeft = useCountdownSeconds(timeout ?? Infinity);
	const showMsg = timeLeft === 0;
	const { t } = useTranslation();

	if (showMsg && errorMsg) {
		showToast({
			type: "error",
			title: t("error"),
			subtitle: errorMsg
		});
	}

	if (timeLeft < 0) return null;
	return (
		<div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-gray-100 bg-opacity-75">
			<LoadingCircle className="h-8 w-8" />
			<span className="ml-2">Loading...</span>
		</div>
	);
}

export function LoadingCircleCorner() {
	return (
		<div className="fixed bottom-12 right-5 z-50 flex items-center justify-center">
			<LoadingCircle className="h-4 w-4" />
			Loading...
		</div>
	);
}
