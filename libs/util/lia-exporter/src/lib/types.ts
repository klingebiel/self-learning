export type ExportOptions = {
	addTitlePage?: boolean;
	language?: "en" | "de";
	narrator?: "female" | "male";
	considerTopics?: boolean;
	exportMailAddresses?: boolean;
	storagesToInclude?: string[];
	storageDestination?: string;
};

/**
 * Used to make absolute paths to media files on our storage server relative.
 */
export type MediaFileReplacement = {
	source: string;
	destination: string;
};

export type IncompleteNanoModuleExport = {
	nanomodule: {
		name: string;
		id: string;
	};
	missedElements: MissedElement[];
};

/**
 * List of unsupported items (w.r.t reporting).
 * Extend this list if necessary.
 */
export type MissedElement = IncompleteArticle | IncompleteProgrammingTask;

export type IncompleteArticle = {
	type: "article";
	id: string;
	cause: string[];
};

export type IncompleteProgrammingTask = {
	type: "programming";
	id: string;
	cause: "unsupportedLanguage" | "unsupportedSolution";
	language: string;
};