import { SkillFormModel } from "@self-learning/types";
import { Alert, SimpleDialog } from "@self-learning/ui/common";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ShowCyclesDialog({ cycleParticipants }: { cycleParticipants: SkillFormModel[] }) {
	const [openExplanation, setShowDialog] = useState<boolean>(false);
	const { t } = useTranslation();

	if (cycleParticipants.length > 0) {
		return (
			<>
				<Alert
					type={{
						severity: "ERROR",
						message: (
							<div>
								<button
									onClick={() => setShowDialog(true)}
									className="text-left hover:cursor-pointer hover:text-red-700"
								>
									<span>{t("skill_cycle_warning_message")}</span>
								</button>
							</div>
						)
					}}
				/>
				{openExplanation && (
					<SimpleDialog
						name={t("cycle_representation")}
						onClose={() => setShowDialog(false)}
					>
						<CycleComponents cycles={cycleParticipants} />
					</SimpleDialog>
				)}
			</>
		);
	}

	return null;
}
// TODO darstellung optimieren
function CycleComponents<S extends { name: string }>({ cycles }: { cycles: S[] }) {
	return (
		<>
			{cycles.map((cycle, index) => {
				return (
					<button key={index} className="m-5 rounded-md bg-gray-200 p-5">
						{cycle.name}
					</button>
				);
			})}
		</>
	);
}

export type SkillProps = { repoId: string; skills: SkillFormModel[] };
