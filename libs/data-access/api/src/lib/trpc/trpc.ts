import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { z } from "zod";
import { database } from "@self-learning/database";

export const t = initTRPC.context<Context>().create();

const authMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({ ctx: ctx as Required<Context> });
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.user.role !== "ADMIN") {
		throw new TRPCError({ code: "FORBIDDEN", message: "Requires 'ADMIN' role." });
	}

	return next({ ctx: ctx as Required<Context> });
});

const isAuthorMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.user.isAuthor !== true) {
		throw new TRPCError({ code: "FORBIDDEN", message: "Requires 'AUTHOR' role." });
	}

	return next({ ctx: ctx as Required<Context> });
});

/** Creates a `t.procedure` that requires an authenticated user. */
export const authProcedure = t.procedure.use(authMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `ADMIN` role. */
export const adminProcedure = t.procedure.use(adminMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `AUTHOR` role. */
export const authorProcedure = t.procedure.use(isAuthorMiddleware);
/** Procedure that valides if user is author of given course. */
export const isCourseAuthorProcedure = t.procedure
	.input(z.object({ courseId: z.string() }))
	.use(async opts => {
		const { courseId } = opts.input;
		const { user } = opts.ctx;

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		if (user.role === "ADMIN") {
			return opts.next();
		}

		const isAuthor = await checkIfUserIsAuthor(user.name, courseId);
		if (!isAuthor) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "User is not author of this course!"
			});
		}

		return opts.next();
	});

async function checkIfUserIsAuthor(username: string, courseId: string) {
	const course = await database.course.findUniqueOrThrow({
		where: { courseId },
		select: {
			authors: {
				select: {
					username: true
				}
			}
		}
	});

	return course.authors.some(author => author.username === username);
}

export async function createTrpcContext({
	req,
	res
}: trpcNext.CreateNextContextOptions): Promise<Context> {
	const session = await unstable_getServerSession(req, res, authOptions);

	if (!session) {
		return {};
	}

	return {
		user: session.user
	};
}

type Context = {
	user?: Session["user"];
};

export type UserFromSession = Session["user"];
