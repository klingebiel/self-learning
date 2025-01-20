import { createOpenApiNextHandler } from "trpc-openapi";
import { Context } from "./context";
import { appRouter } from "./app.router";
import { TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";

// This handler will process all REST API requests under /api/rest/*
/**
 * Creates a REST API handler for TRPC to process all REST API requests under /api/rest/*.
 * @param contextHandler For production use `createTrpcContext` of `@self-learning/api`; for testing keep unspecified.
 * @returns OpenAPI handler for REST API.
 */
type ContextHandler = ({ req, res }: trpcNext.CreateNextContextOptions) => Promise<Context>;

export function restApiHandler(contextHandler?: ContextHandler) {
	return createOpenApiNextHandler({
		router: appRouter,
		createContext: contextHandler,
		onError({ error, type, path, input, ctx }) {
			if (process.env.NODE_ENV === "development") {
				console.error("Error:", {
					error,
					type,
					path,
					input,
					ctx: ctx ? "has context" : "no context"
				});
			}

			// Return HTTP error code based on TRPC error
			if (error instanceof TRPCError) {
				switch (error.code) {
					case "NOT_FOUND":
						return { statusCode: 404, message: error.message };
					case "UNAUTHORIZED":
						return { statusCode: 401, message: error.message };
					case "FORBIDDEN":
						return { statusCode: 403, message: error.message };
					case "BAD_REQUEST":
						return { statusCode: 400, message: error.message };
				}
			}

			// Default to 500 for unknown errors
			return { statusCode: 500, message: "Internal server error" };
		},
		responseMeta: () => {
			return {
				headers: {
					"Cache-Control": "no-cache",
					"Content-Type": "application/json"
				}
			};
		}
	});
}
