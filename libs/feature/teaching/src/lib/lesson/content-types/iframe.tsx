import { getContentTypeDisplayName, PDF } from "@self-learning/types";
import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function IFrameInput({ index }: { index: number }) {
	const { t } = useTranslation();
	const { control } = useFormContext<{ content: PDF[] }>();
	const { update } = useFieldArray<{ content: PDF[] }>({
		name: "content"
	});

	const {
		value: { url }
	} = useWatch({ control, name: `content.${index}` });

	return (
		<SectionCard>
			<SectionCardHeader
				title={getContentTypeDisplayName("iframe")}
				subtitle={t("iframe_subtitle")}
			/>

			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-4 md:flex-row">
					<LabeledField label="URL">
						<input
							type={"text"}
							className="textfield w-full"
							value={url}
							onChange={e =>
								update(index, {
									type: "pdf",
									value: { url: e.target.value },
									meta: {
										estimatedDuration: 0
									}
								})
							}
						/>
					</LabeledField>
				</div>
				{url && url.length > 0 ? (
					<iframe src={url} title="iframe" width="100%" height="500px"></iframe>
				) : (
					<div className="h-[500px] w-full bg-gray-200"></div>
				)}
			</div>
		</SectionCard>
	);
}
