import type { AppRouter } from "@self-learning/api";
import { Footer, Navbar } from "@self-learning/ui/layouts";
import { httpBatchLink } from "@trpc/client";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { withTRPC } from "@trpc/next";
import "katex/dist/katex.css";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import superjson from "superjson";
import { GlobalFeatures } from "../../_features";
import "./styles.css";
import { appWithTranslation } from "next-i18next";

export default withTRPC<AppRouter>({
	config() {
		return {
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === "development" ||
						(opts.direction === "down" && opts.result instanceof Error)
				}),
				httpBatchLink({
					url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/trpc`
				})
			],
			transformer: superjson,
			queryClientConfig: {
				defaultOptions: {
					queries: {
						retry: false,
						staleTime: Infinity
					}
				}
			}
		};
	}
})(appWithTranslation(CustomApp));

function CustomApp({ Component, pageProps }: AppProps) {
	const Layout = (Component as any).getLayout
		? (Component as any).getLayout(Component, pageProps)
		: null;

	return (
		<>
			{process.env.NODE_ENV === "development" && (
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
			)}
			<PlausibleProvider
				domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OWN_DOMAIN ?? ""}
				customDomain={process.env.NEXT_PUBLIC_PLAUSIBLE_CUSTOM_INSTANCE}
				trackLocalhost={process.env.NODE_ENV === "development"}
			>
				<SessionProvider
					session={pageProps.session}
					basePath={useRouter().basePath + "/api/auth"}
				>
					<Head>
						<title>Self-Learning</title>
					</Head>
					<GlobalFeatures />
					<Navbar />
					<main className="grid grow">
						{Layout ? <>{Layout}</> : <Component {...pageProps} />}
					</main>
					<Footer />
				</SessionProvider>
			</PlausibleProvider>
		</>
	);
}
