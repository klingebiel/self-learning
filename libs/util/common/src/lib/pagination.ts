import { z } from "zod";

export type Paginated<T> = {
	result: T[];
	/** Current page number. */
	page: number;
	/** Total number of records that matched the query. */
	totalCount: number;
	/** Max. number of items on a page (the `take` value). */
	pageSize: number;
};

/**
 * Pagination helper.
 *
 * @param, take, number of elements to get
 * @param, page, page number (default: `1`)
 * @example
 * const where = {
 * 	title: "The",
 * 	...paginate(15, 1) // Get the first 15 elements
 * }
 */
export function paginate(take: number, page: number): { skip: number; take: number } {
	return {
		take,
		skip: (page - 1) * take
	};
}

export const paginationSchema = z.object({
	page: z
		.number()
		.positive()
		.describe('Page number, starting at 1. Use "page=1" for the first page.')
});
