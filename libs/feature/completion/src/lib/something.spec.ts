import { mockDeep, mockReset, DeepMockProxy, mock } from "jest-mock-extended";
import { database } from "@self-learning/database";
import createPrismaMock from "prisma-mock";
import { Prisma, PrismaClient } from "@prisma/client";

// Mock the "database" module
jest.mock("@self-learning/database", () => ({
	__esModule: true,
	...jest.requireActual("@self-learning/database"),
	database: jest
}));

const mockedDbModule = jest.createMockFromModule<typeof database>("@self-learning/database");

const mockDb = mockDeep<typeof database>();

beforeAll(() => {});

describe("Something", () => {
	beforeEach(() => {
		createPrismaMock({}, Prisma.dmmf.datamodel);
	});

	it("should work with nested properties", async () => {
		console.log(database);
	});
});
