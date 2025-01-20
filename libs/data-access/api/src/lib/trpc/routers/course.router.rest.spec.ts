import { restQuery, createCourseMock } from "@self-learning/util/testing";
import { database } from "@self-learning/database";

// Mock the database
jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			findUnique: jest.fn(),
			findMany: jest.fn()
		}
	}
}));

describe("REST API of Course Router", () => {
	describe("[GET]: /courses", () => {
		const coursesMock = Array(15)
			.fill(null)
			.map((_, index) => {
				return createCourseMock({
					title: `Course ${index}`,
					courseId: `course ${index}`,
					slug: `slug${index}`,
					authors: ["Author1"],
					content: []
				});
			});
		for (let i = 5; i < 10; i++) {
			coursesMock[i].authors = [{ username: "Author2" }];
		}
		for (let i = 10; i < coursesMock.length; i++) {
			coursesMock[i].authors = [{ username: "Author1" }, { username: "Author2" }];
		}

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findMany as jest.Mock).mockImplementation(async query => {
				let courses = coursesMock;

				// Simulate filtering by author (WHERE query)
				if (query.where && query.where.authors) {
					courses = courses.filter(course =>
						course.authors.some(
							author => author.username === query.where.authors.some.username
						)
					);
				}

				return courses;
			});
		});

		it("should list all courses (paginated) if no filter specified", async () => {
			const pageSize = 20;

			// Query parameters must use JSON.stringify
			// See: https://trpc.io/docs/rpc#methods---type-mapping
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["courses"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize)
				}
			});

			const expected = {
				result: coursesMock.slice(0, pageSize).map(course => ({
					title: course.title,
					slug: course.slug
				})),
				pageSize,
				page: 1,
				totalCount: coursesMock.length
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});

		it("should accept filter parameter: authorId", async () => {
			const pageSize = 20;

			// Query parameters must use JSON.stringify
			// See: https://trpc.io/docs/rpc#methods---type-mapping
			const response = await restQuery({
				method: "GET",
				query: {
					trpc: ["courses"],
					page: JSON.stringify(1),
					pageSize: JSON.stringify(pageSize),
					authorId: "Author1"
				}
			});

			// Remove courses without "Author1": [5, 6, 7, 8, 9]
			coursesMock.splice(5, 5);
			const expected = {
				result: coursesMock.map(course => ({
					title: course.title,
					slug: course.slug
				})),
				pageSize,
				page: 1,
				totalCount: Math.min(coursesMock.length, pageSize)
			};

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual(expected);
		});
	});

	describe("[GET]: /courses/{slug}", () => {
		// For the test required properties of Course
		const courseMock = createCourseMock({
			title: "Course 1",
			subtitle: "Subtitle 1",
			courseId: "course1",
			slug: "slug1",
			authors: ["Author1"],
			content: [
				{
					chapterTitle: "Chapter 1",
					lessons: ["lesson1"]
				}
			],
			description: "Course Description"
		});

		beforeEach(() => {
			jest.clearAllMocks();
			// Mock the database response
			(database.course.findUnique as jest.Mock).mockImplementation(async input => {
				if (input.where.slug === courseMock.slug) {
					return courseMock;
				} else {
					return null;
				}
			});
		});

		it("should return course information for valid slug", async () => {
			const response = await restQuery({
				method: "GET",
				query: { trpc: ["courses", courseMock.slug] }
			});

			expect(response.statusCode).toBe(200);
			expect(response.body).toEqual({
				title: courseMock.title,
				subtitle: courseMock.subtitle,
				slug: courseMock.slug,
				lessons: courseMock.content.reduce(
					(acc, chapter) => acc + chapter.content.length,
					0
				),
				description: courseMock.description
			});
		});

		it("should return 404 for invalid slug", async () => {
			const response = await restQuery({
				method: "GET",
				query: { trpc: ["courses", "invalid-slug-id"] }
			});

			expect(response.statusCode).toBe(404);
		});
	});
});
