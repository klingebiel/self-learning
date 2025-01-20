/* eslint-disable @typescript-eslint/no-explicit-any */
import { restApiHandler } from "@self-learning/api";
import type { NextApiRequest, NextApiResponse } from "next";
import { ZodIssue } from "zod";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

type OpenApiSuccessResponse<D = any> = D;

type OpenApiErrorResponse = {
	message: string;
	code: TRPC_ERROR_CODE_KEY;
	issues?: ZodIssue[];
};

type OpenApiResponse<D = any> = OpenApiSuccessResponse<D> | OpenApiErrorResponse;

/**
 * Simulates a request to test REST API endpoints.
 * Based on: https://github.com/trpc/trpc-openapi/blob/0969818c2da30b06706cccdb27cbf54ba813ab1a/test/adapters/next.test.ts#L24-L66
 * @param req Specifies the request (HTTP method, path, query parameters, and body).
 * @returns HTTP code and response body.
 */
export const restQuery = (req: {
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
	query: Record<string, any>;
	body?: any;
}) => {
	return new Promise<{
		statusCode: number;
		headers: Record<string, any>;
		body: OpenApiResponse | undefined;
		/* eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor */
	}>(async (resolve, reject) => {
		const headers = new Map();
		let body: any;
		const res: any = {
			statusCode: undefined,
			setHeader: (key: string, value: any) => headers.set(key, value),
			end: (data: string) => {
				body = JSON.parse(data);
			}
		};

		try {
			await restApiHandler()(
				req as unknown as NextApiRequest,
				res as unknown as NextApiResponse
			);
			resolve({
				statusCode: res.statusCode,
				headers: Object.fromEntries(headers.entries()),
				body
			});
		} catch (error) {
			reject(error);
		}
	});
};
