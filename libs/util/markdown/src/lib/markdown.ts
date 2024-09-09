import { serialize } from "next-mdx-remote/serialize";
import rehypeExternalLinks from "rehype-external-links";
import { invalidLanguageFilter } from "./invalid-language-filter";
// Rehype packages
import rehypeKatex from "rehype-katex";
import rehypePrismPlus from "rehype-prism-plus";
// Remark packages
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Pluggable } from "unified";

export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [
	rehypeKatex,
	invalidLanguageFilter,
	rehypePrismPlus,
	[rehypeExternalLinks, { target: "_blank" }] as Pluggable
];

/**
 * Converts a markdown document to an object that can be rendered in a {@link MDXRemote} component.
 * The given markdown string should not include front matter.
 *
 * @example
 * // i.e. in getStaticProps:
 * ```ts
 * const compiledMarkdown = compileMarkdown("#Hello World");
 * ```
 *
 * // In component:
 * ```tsx
 * <MDXRemote {...compiledMarkdown}></MDXRemote>
 * ```
 *
 */
export function compileMarkdown(markdown: string) {
	return serialize(markdown, {
		parseFrontmatter: true,
		mdxOptions: {
			format: "md",
			remarkPlugins,
			rehypePlugins,
			development: true
		}
	});
}

/**
 * Return type of the {@link compileMarkdown} function.
 * @example
 * type PageProps = {
 * 	markdownContent: CompiledMarkdown;
 * }
 *
 * export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
 * 	const markdownContent = await compileMarkdown(team.description);
 * 	return {
 * 		props: { markdownContent }
 * 	};
 * };
 */
export type CompiledMarkdown = Awaited<ReturnType<typeof compileMarkdown>>;

export type MdLookup = { [id: string]: CompiledMarkdown };
export type MdLookupArray = { [id: string]: CompiledMarkdown[] };
