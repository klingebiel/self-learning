const { getJestProjectsAsync } = require("@nx/jest");

export default async () => ({
	projects: await getJestProjectsAsync(),
	coverageReporters: ["cobertura", "text", "html"]
});
