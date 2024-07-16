import { formatDistance } from "date-fns";
import { de } from "date-fns/locale";
import { enGB } from "date-fns/locale";
import { i18n } from "./localization/i18n";

/**
 * Formats seconds to "hh:mm:ss" (hh will be removed if less than an hour).
 *
 * @example
 * formatSeconds(42); // "00:42"
 * formatSeconds(120); // "02:00"
 * formatSeconds(3600); // "01:00:00"
 */
export function formatSeconds(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;
	return `${hours > 0 ? `${hours}:` : ""}${
		hours > 0 ? minutes.toString().padStart(2, "0") : minutes
	}:${secondsLeft.toString().padStart(2, "0")}`;
}

export function formatDateAgo(date: Date | string | number) {
	const lang = i18n.language;
	let locale = de;
	if (lang == "en") {
		locale = enGB;
	}
	return formatDistance(new Date(date), Date.now(), {
		addSuffix: true,
		locale: locale
	});
}
