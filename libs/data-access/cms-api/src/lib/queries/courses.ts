import { gql } from "graphql-request";
import { cmsGraphqlClient } from "../cms-graphql-client";

export async function getCourseBySlug(slug: string) {
	const result = await cmsGraphqlClient.courseBySlug({ slug });
	return result.courses?.data[0]?.attributes ?? null;
}

gql`
	query courseBySlug($slug: String!) {
		courses(filters: { slug: { eq: $slug } }) {
			data {
				id
				attributes {
					title
					slug
					subtitle
					description
					createdAt
					updatedAt
					image {
						data {
							attributes {
								url
								alternativeText
							}
						}
					}
					authors {
						data {
							attributes {
								slug
								name
								image {
									data {
										attributes {
											url
											alternativeText
										}
									}
								}
							}
						}
					}
					content {
						__typename
						... on ComponentTableOfContentsChapter {
							__typename
							title
							description
							lessons {
								lesson {
									data {
										attributes {
											lessonId
											slug
											title
										}
									}
								}
							}
						}
						... on ComponentTableOfContentsCourseRelation {
							title
							description
							course {
								data {
									attributes {
										slug
										title
										subtitle
										image {
											data {
												attributes {
													url
												}
											}
										}
									}
								}
							}
						}
						... on ComponentTableOfContentsLessonRelation {
							__typename
							lesson {
								data {
									attributes {
										lessonId
										slug
										title
										subtitle
										image {
											data {
												attributes {
													url
													alternativeText
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

export async function getCoursesWithSlugs(slugs: string[]) {
	const result = await cmsGraphqlClient.coursesWithSlugs({ slugs });
	return (
		result.courses?.data.map(
			data => data.attributes as Exclude<typeof data["attributes"], null | undefined>
		) ?? []
	);
}

gql`
	query coursesWithSlugs($slugs: [String]!) {
		courses(filters: { slug: { in: $slugs } }) {
			data {
				attributes {
					slug
					title
					subtitle
					image {
						data {
							attributes {
								url
							}
						}
					}
				}
			}
		}
	}
`;

export async function getCoursesForSync() {
	const result = await cmsGraphqlClient.coursesForSync();

	return {
		courses:
			result.courses?.data.map(({ attributes }) => {
				const attr = attributes as Exclude<typeof attributes, undefined | null>;

				console.log("Get Course for sync");
				console.log(JSON.stringify(attr.content, null, 4));

				return {
					courseId: attr.courseId,
					slug: attr.slug,
					title: attr.title,
					subtitle: attr.subtitle,
					imgUrl: attr.image?.data?.attributes?.url,
					content: attr.content
				};
			}) ?? [],
		_total: result.courses?.meta.pagination.total
	};
}

gql`
	query coursesForSync {
		courses(pagination: { limit: -1 }) {
			meta {
				pagination {
					total
				}
			}
			data {
				attributes {
					courseId
					slug
					title
					subtitle
					image {
						data {
							attributes {
								url
							}
						}
					}
					content {
						... on ComponentTableOfContentsChapter {
							__typename
							title
							description
							lessons {
								lesson {
									data {
										attributes {
											lessonId
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;
