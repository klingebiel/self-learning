import i18next from "i18next";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export function Certainty() {
	const { certainty, certaintyPhrase, setCertainty } = useCertainty(100);
	const { t } = useTranslation();
	return (
		<div className="grid items-start gap-4">
			<span className="text-xl tracking-tighter">{t("certainty_ask")}</span>

			<div className="mt-2 flex flex-col">
				<input
					type="range"
					min={0}
					max={100}
					step={25}
					value={certainty}
					onChange={e => setCertainty(e.target.valueAsNumber)}
					className="w-full"
				/>
				<span className="mt-1 text-right text-slate-400">
					{t("certainty_text")}{" "}
					<span className="font-semibold text-slate-700">{certaintyPhrase}</span>.
				</span>
			</div>
		</div>
	);
}

function useCertainty(initialCertainty: number) {
	const [certainty, setCertainty] = useState(initialCertainty);

	const certaintyPhrase = useMemo(() => {
		return mapCertainty(certainty);
	}, [certainty]);

	return { certainty, setCertainty, certaintyPhrase };
}

function mapCertainty(certainty: number): string {
	if (certainty < 25) {
		return i18next.t("certainty<25");
	}
	if (certainty < 50) {
		return i18next.t("certainty_50");
	}
	if (certainty < 75) {
		return i18next.t("certainty_75");
	}
	if (certainty < 100) {
		return i18next.t("certainty_100");
	}
	if (certainty >= 100) {
		return i18next.t("certainty_complete");
	}

	return "";
}
