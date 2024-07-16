import { SectionCard, SectionCardHeader } from "@self-learning/ui/common";
import { MarkdownField } from "@self-learning/ui/forms";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function ArticleInput({ index }: { index: number }) {
	const { t } = useTranslation();
	return (
		<SectionCard>
			<SectionCardHeader title={t("article")} subtitle={t("article_subtitle")} />

			<Controller
				name={`content.${index}.value.content`}
				render={({ field }) => (
					<MarkdownField
						content={field.value}
						setValue={value => field.onChange(value)}
					/>
				)}
			></Controller>
		</SectionCard>
	);
}
