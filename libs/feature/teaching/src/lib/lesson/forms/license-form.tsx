import { trpc } from "@self-learning/api-client";
import { License } from "@self-learning/types";
import { LoadingBox } from "@self-learning/ui/common";
import { useFormContext } from "react-hook-form";
import { LessonFormModel } from "../lesson-form-model";
import { Form } from "@self-learning/ui/forms";
import { useTranslation } from "react-i18next";

// Handles loading of licenses and makes them selectable afterwards
export function LicenseForm() {
	const { data: licenses, isLoading } = trpc.licenseRouter.getAll.useQuery();
	const { t } = useTranslation();

	if (isLoading) {
		return <LoadingBox />;
	} else {
		return (
			<Form.SidebarSection>
				<Form.SidebarSectionTitle
					title={t("license")}
					subtitle={t("lesson_license_text")}
				/>
				<OptionalLicenseSelector licenses={licenses} />
			</Form.SidebarSection>
		);
	}
}

// Checks and handles if there are no licenses available
function OptionalLicenseSelector({ licenses }: { licenses?: License[] }) {
	if (licenses && licenses.length > 0) {
		return <LicenseSelector licenses={licenses} />;
	} else {
		return <p>No Licenses available</p>;
	}
}

// Makes licenses selectable after checking if there are any
function LicenseSelector({ licenses }: { licenses: License[] }) {
	const { setValue, watch } = useFormContext<LessonFormModel>();
	const getDefaultLicense = () =>
		licenses.find(license => license.defaultSuggestion)?.licenseId ?? licenses[0].licenseId;
	const currentValue = watch("licenseId");

	return (
		<select
			className="textfield"
			value={currentValue ?? getDefaultLicense()}
			// target.value is a number as string
			// + operator converts the number: https://www.techiediaries.com/javascript/convert-string-number-array-react-hooks-vuejs/
			onChange={e => setValue("licenseId", +e.target.value)}
		>
			{licenses
				.filter(license => license.selectable)
				.map(license => (
					<option
						key={license.licenseId}
						value={license.licenseId}
						className={license.oerCompatible ? "text-black" : "text-gray-400"}
					>
						{license.name}
					</option>
				))}
		</select>
	);
}
