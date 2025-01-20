import { getServerSideProps } from "../../../pages/teaching/courses/edit/[courseId]";
import { database } from "@self-learning/database";
import { getServerSession } from "next-auth";
import { createMockContext } from "../../context-utils";
import { createCourseMock, createLessonMock } from "@self-learning/util/testing";

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
		course: { findUnique: jest.fn() },
		lesson: { findMany: jest.fn() }
	}
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { courseId: "course1" } });

	describe("Authorization", () => {
		const lessonMock = createLessonMock({
			lessonId: "lesson1",
			authors: ["Author1", "Author2"]
		});

		const courseMock = createCourseMock({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			courseId: mockCtx.params!.courseId as string,
			authors: ["Author1"],
			content: [
				{
					chapterTitle: "Chapter 1",
					lessons: [lessonMock.lessonId]
				}
			]
		});

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseMock);
			(database.lesson.findMany as jest.Mock).mockResolvedValue([lessonMock]);
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
			expect(result).toMatchObject({
				notFound: false,
				props: {
					course: expect.any(Object),
					lessons: expect.any(Array)
				}
			});
		});

		it("should grant access to Author of Lesson", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: {
					isAuthor: true,
					role: "USER",
					name: courseMock.authors[0].username
				}
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toMatchObject({
				notFound: false,
				props: {
					course: expect.any(Object),
					lessons: expect.any(Array)
				}
			});
		});
	});
});
