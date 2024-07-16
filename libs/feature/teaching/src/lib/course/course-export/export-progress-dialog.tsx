import { DialogWithReactNodeTitle, ProgressBar } from "@self-learning/ui/common";
import { CenteredContainer } from "@self-learning/ui/layouts";
import { CourseFormModel } from "../course-form-model";
import { IncompleteNanoModuleExport, exportCourseArchive } from "@self-learning/lia-exporter";
import { useEffect, useState, useRef } from "react";
import { trpc } from "@self-learning/api-client";
import { useTranslation } from "react-i18next";

// Optional public env variable that indicates were the storage is located
const minioUrl = process.env["NEXT_PUBLIC_MINIO_PUBLIC_URL"];
const storagesToInclude = ["https://staging.sse.uni-hildesheim.de:9006/upload/"];
minioUrl && storagesToInclude.push(minioUrl);

/**
 * Initiates the download of the given blob as a zip archive with the given filename.
 * @param blob The content (binary data) of the zip archive
 * @param filename The destination name. The file extension should be .zip
 */
function startBrowserDownload(blob: Blob, filename: string) {
	const downloadUrl = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = downloadUrl;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(downloadUrl);
	document.body.removeChild(a);
}

export function ExportCourseProgressDialog({
	course,
	onClose,
	onFinish,
	onError
}: {
	course: CourseFormModel;
	onClose: () => void;
	onFinish: () => void;
	onError: (report: IncompleteNanoModuleExport[]) => void;
}) {
	const { t } = useTranslation();
	const title = `${t("do_export")} ${course.title}`;
	const [message, setMessage] = useState(`Export: ${course.title}`);

	const { data, isLoading } = trpc.course.fullExport.useQuery({ slug: course.slug });
	const [exportResult, setExportResult] = useState<Blob | null>(null);

	const [progress, setProgress] = useState(0);
	const abortController = useRef(new AbortController());

	// This effect triggers the download after the content was generated
	useEffect(() => {
		if (exportResult) {
			try {
				const blob = new Blob([exportResult], { type: "blob" });
				startBrowserDownload(blob, `${course.title}.zip`);
				onFinish();
			} catch (error) {
				// Display error message to user
				setMessage(`Error: ${error}`);
			}
		}
	}, [exportResult, course, onFinish]);

	// This effect will trigger the content generation after the data was loaded completely
	useEffect(() => {
		if (data && !isLoading) {
			const convert = async () => {
				try {
					const { zipArchive, incompleteExportedItems } = await exportCourseArchive(
						data,
						abortController.current.signal,
						setProgress,
						setMessage,
						{
							storagesToInclude
						}
					);
					if (zipArchive) {
						setExportResult(zipArchive);
					}
					if (incompleteExportedItems.length > 0) {
						onError(incompleteExportedItems);
					}
				} catch (error) {
					// Display error message to user
					setMessage(`Error: ${error}`);
				}
			};

			convert();
		}
	}, [data, isLoading, onError]);

	const closeLabel = message.startsWith("Error") ? t("close") : t("cancel");

	return (
		<CenteredContainer>
			<DialogWithReactNodeTitle
				style={{ height: "30vh", width: "60vw", overflow: "auto" }}
				title={title}
				// Prevent closing the dialog by clicking on the backdrop
				onClose={() => {}}
			>
				{progress < 100 && <ProgressBar progress={progress} />}
				<div className="overlay">{message}</div>
				<div className="grid justify-items-end">
					<button
						className="btn-primary w-min "
						type="button"
						onClick={() => {
							abortController.current.abort();
							onClose();
						}}
					>
						{closeLabel}
					</button>
				</div>
			</DialogWithReactNodeTitle>
		</CenteredContainer>
	);
}
