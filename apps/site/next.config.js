// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require("@nx/next");
const { withPlausibleProxy } = require("next-plausible");
const { i18n } = require("./next-i18next.config.js");

const packageJson = require("../../package.json");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**"
			}
		]
	},
	nx: {
		// Set this to true if you would like to to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: true
	},
	i18n,
	basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
	assetPrefix: process.env.NEXT_ASSET_PREFIX,
	trailingSlash: process.env.NEXT_TRAILING_SLASH ?? false,
	reactStrictMode: process.env.NODE_ENV === "development",
	productionBrowserSourceMaps: process.env.NODE_ENV === "development",
	experimental: {
		swcPlugins: [["next-superjson-plugin", {}]]
	},
	env: {
		APP_VERSION: packageJson.version
	}
};

module.exports = withNx(
	withPlausibleProxy({
		customDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE
	})(nextConfig)
);
