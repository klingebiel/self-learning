import { database } from "@self-learning/database";
import { specializationSchema } from "@self-learning/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authProcedure, t, UserFromSession } from "../trpc";

export const specializationRouter = t.router({
	getById: authProcedure.input(z.object({ specializationId: z.string() })).query(({ input }) => {
		return database.specialization.findUniqueOrThrow({
			where: { specializationId: input.specializationId },
			select: {
				specializationId: true,
				slug: true,
				cardImgUrl: true,
				title: true,
				subject: {
					select: {
						subjectId: true,
						slug: true,
						title: true
					}
				}
			}
		});
	}),
	getForEdit: authProcedure
		.input(z.object({ specializationId: z.string() }))
		.query(({ input }) => {
			return database.specialization.findUniqueOrThrow({
				where: { specializationId: input.specializationId },
				select: {
					specializationId: true,
					subjectId: true,
					slug: true,
					title: true,
					subtitle: true,
					cardImgUrl: true,
					imgUrlBanner: true
				}
			});
		}),
	getAll: authProcedure.query(() => {
		return database.specialization.findMany({
			select: {
				specializationId: true,
				title: true
			}
		});
	}),
	create: authProcedure
		.input(
			z.object({
				subjectId: z.string(),
				data: specializationSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const canCreate = await canCreateSpecializationInSubject(input.subjectId, ctx.user);

			if (!canCreate) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${input.subjectId}.`
				});
			}

			const specialization = await database.specialization.create({
				data: {
					subjectId: input.subjectId,
					specializationId: input.data.slug,
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner
				}
			});

			console.log("[specializationRouter.create]: Specialization created by", ctx.user.name, {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		}),
	update: authProcedure
		.input(
			z.object({
				subjectId: z.string(),
				data: specializationSchema
			})
		)
		.mutation(async ({ ctx, input }) => {
			const canEdit = await canEditSpecializationInSubject(
				input.subjectId,
				input.data.specializationId,
				ctx.user
			);

			if (!canEdit) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${input.subjectId} or specializationAdmin in ${input.data.specializationId}.`
				});
			}

			const specialization = await database.specialization.update({
				where: { specializationId: input.data.specializationId },
				data: {
					title: input.data.title,
					slug: input.data.slug,
					subtitle: input.data.subtitle,
					cardImgUrl: input.data.cardImgUrl,
					imgUrlBanner: input.data.imgUrlBanner
				}
			});

			console.log("[specializationRouter.update]: Specialization updated by", ctx.user.name, {
				specializationId: specialization.specializationId,
				subjectId: specialization.subjectId,
				slug: specialization.slug,
				title: specialization.title
			});

			return specialization;
		}),
	addCourse: authProcedure
		.input(
			z.object({ subjectId: z.string(), specializationId: z.string(), courseId: z.string() })
		)
		.mutation(async ({ input: { subjectId, specializationId, courseId }, ctx }) => {
			if (!canEditSpecializationInSubject(subjectId, specializationId, ctx.user)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${subjectId} or specializationAdmin in ${specializationId}.`
				});
			}

			const added = await database.specialization.update({
				where: { specializationId },
				data: {
					courses: {
						connect: { courseId }
					}
				},
				select: {
					specializationId: true
				}
			});

			console.log(
				"[specializationRouter.addCourse]: Course added to specialization by",
				ctx.user.name,
				{ specializationId, courseId }
			);
			return added;
		}),
	removeCourse: authProcedure
		.input(
			z.object({ subjectId: z.string(), specializationId: z.string(), courseId: z.string() })
		)
		.mutation(async ({ input: { subjectId, specializationId, courseId }, ctx }) => {
			if (!canEditSpecializationInSubject(subjectId, specializationId, ctx.user)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `Requires ADMIN role or subjectAdmin in ${subjectId} or specializationAdmin in ${specializationId}.`
				});
			}

			const added = await database.specialization.update({
				where: { specializationId },
				data: {
					courses: {
						disconnect: { courseId }
					}
				},
				select: {
					specializationId: true
				}
			});

			console.log(
				"[specializationRouter.removeCourse]: Course removed from specialization by",
				ctx.user.name,
				{ specializationId, courseId }
			);
			return added;
		})
});

async function canCreateSpecializationInSubject(
	subjectId: string,
	user: UserFromSession
): Promise<boolean> {
	if (user.role === "ADMIN") {
		return true;
	}

	const subjectAdmin = await database.subjectAdmin.findUnique({
		where: {
			subjectId_username: { subjectId, username: user.name }
		}
	});

	if (subjectAdmin) {
		return true;
	}

	return false;
}

async function canEditSpecializationInSubject(
	subjectId: string,
	specializationId: string,
	user: UserFromSession
): Promise<boolean> {
	const canCreate = await canCreateSpecializationInSubject(subjectId, user);

	if (canCreate) {
		return true;
	}

	const specializationAdmin = await database.specializationAdmin.findUnique({
		where: {
			specializationId_username: { specializationId, username: user.name }
		}
	});

	if (specializationAdmin) {
		return true;
	}

	return false;
}
