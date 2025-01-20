import { getServerSideProps } from "../../../../pages/courses/[courseSlug]/[lessonSlug]/index";
import { database } from "@self-learning/database";
import { getServerSession } from "next-auth";
import { createMockContext } from "../../../context-utils";
import { compileMarkdown } from "@self-learning/markdown";
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
		lesson: { findUnique: jest.fn() }
	}
}));

jest.mock("@self-learning/markdown", () => ({
	compileMarkdown: jest.fn()
}));

describe("getServerSideProps", () => {
	const mockCtx = createMockContext({ params: { courseSlug: "course1", lessonSlug: "lesson1" } });

	describe("Authorization", () => {
		// For te test required properties of Lesson
		const lessonMock = createLessonMock({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			lessonId: mockCtx.params!.lessonId as string,
			authors: ["Author1", "Author2"]
		});

		// For the test required properties of Course
		const courseMock = createCourseMock({
			courseId: "course1",
			authors: ["Author1"],
			content: [
				{
					chapterTitle: "Chapter 1",
					lessons: [lessonMock.lessonId]
				}
			]
		});
		const redirectPage = "loginPage";

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockResolvedValue(courseMock);
			(database.lesson.findUnique as jest.Mock).mockResolvedValue(lessonMock);
			(compileMarkdown as jest.Mock).mockResolvedValue("");
			global.encodeURIComponent = jest.fn().mockReturnValue("loginPage");
		});

		it("should redirect to login on anonymous access", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: undefined
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({
				redirect: {
					destination: `/api/auth/signin?callbackUrl=${redirectPage}`,
					permanent: false
				}
			});
		});

		it("should grant access to authenticated users", async () => {
			(getServerSession as jest.Mock).mockResolvedValue({
				user: { name: "user1" }
			});

			const result = await getServerSideProps(mockCtx);
			expect(result).toEqual({
				props: expect.any(Object)
			});
		});
	});
});
