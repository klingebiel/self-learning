import { getServerSideProps } from "../../../pages/teaching/lessons/edit/[lessonId]";
import { database } from "@self-learning/database";
import { getServerSession } from "next-auth";
import { createMockContext } from "../../context-utils";
import { createLessonMock } from "@self-learning/util/testing";

// Mocks getServerSession of withAuth procedure to mock User object
// ESM support & default mock required by NextAuth
jest.mock("next-auth", () => ({
	__esModule: true,
	getServerSession: jest.fn(),
	default: jest.fn()
}));

// Mock the database
jest.mock("@self-learning/database", () => ({
	database: {
		lesson: { findUnique: jest.fn() }
	}
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { lessonId: "lesson1" } });

	describe("Authorization", () => {
		const lessonMock = createLessonMock({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			lessonId: mockCtx.params!.lessonId as string,
			authors: ["Author1", "Author2"]
		});

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonMock);
		});

		it("should redirect non Admins/Authors to 403", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: false,
					role: "USER",
					name: "user1"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({ redirect: { destination: "/403", permanent: false } });
		});

		it("should redirect foreign Author to 403", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					name: "user1"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({ redirect: { destination: "/403", permanent: false } });
		});

		it("should grant access to Admins", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					role: "ADMIN"
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({ props: { lesson: expect.any(Object) } });
		});

		it("should grant access to Author of Lesson", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					name: lessonMock.authors[0].username
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({ props: { lesson: expect.any(Object) } });
		});
	});
});
