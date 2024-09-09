import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";
import { IconButton, ImageChip, OnDialogCloseFn } from "@self-learning/ui/common";
import { Form } from "@self-learning/ui/forms";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CourseFormModel } from "../course/course-form-model";
import { AddAuthorDialog } from "./add-author-dialog";
import { useRouter } from "next/router";
import { useRequiredSession } from "@self-learning/ui/layouts";

interface Author {
	username: string;
	id?: string;
	displayName?: string;
	imgUrl?: string;
	slug?: string;
}

export function AuthorsForm({ subtitle, emptyString }: { subtitle: string; emptyString: string }) {
	const session = useRequiredSession();
	const isAdminUser = session.data?.user.role === "ADMIN";
	const [openAddDialog, setOpenAddDialog] = useState(false);
	const { control } = useFormContext<{ authors: CourseFormModel["authors"] }>();
	const {
		fields: authors,
		append,
		remove,
		replace
	} = useFieldArray({
		control,
		name: "authors"
	});

	const router = useRouter();
	const { query } = router;
	const [authorsFromPreview, setAuthorsFromPreview] = useState<Author[]>([]);

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (typeof window !== "undefined") {
				const storedData = localStorage.getItem("lessonInEditing");
				if (storedData) {
					const lessonData = JSON.parse(storedData);
					const authorsFromData: Author[] = lessonData.authors || [];
					if (authorsFromData.length !== 0) {
						setAuthorsFromPreview(authorsFromData);
					}
				}
			}
		}
	}, [query]);

	useEffect(() => {
		if (query["fromPreview"] === "true") {
			if (authorsFromPreview.length === 0) {
				replace([]);
			} else {
				authorsFromPreview.forEach((author: Author) => {
					const isAuthorAlreadyAdded = authors.some(a => a.username === author.username);
					if (!isAuthorAlreadyAdded) {
						replace(authorsFromPreview);
					}
				});
			}
		}
	}, [authorsFromPreview]);

	const handleAdd: OnDialogCloseFn<CourseFormModel["authors"][0]> = result => {
		if (result) {
			if (authors.find(a => a.username === result.username)) {
				console.log(`Author ${result.username} is already added.`);
				return;
			}

			append(result);
		}
		setOpenAddDialog(false);
	};

	function handleRemove(index: number) {
		window.confirm("Autor entfernen?") && remove(index);
	}

	return (
		<Form.SidebarSection>
			<Form.SidebarSectionTitle title="Autoren" subtitle={subtitle} />

			<IconButton
				type="button"
				data-testid="author-add"
				onClick={() => setOpenAddDialog(true)}
				title="Hinzufügen"
				text="Hinzufügen"
				icon={<PlusIcon className="h-5" />}
			/>
			{authors.length === 0 ? (
				<p className="text-sm text-light">{emptyString}</p>
			) : (
				<ul className="grid gap-4">
					{authors.map(({ username }, index) => (
						<Author
							key={username}
							username={username}
							onRemove={
								authors.length >= 2 || isAdminUser
									? () => handleRemove(index)
									: undefined
							}
						/>
					))}
				</ul>
			)}
			{openAddDialog && <AddAuthorDialog open={openAddDialog} onClose={handleAdd} />}
		</Form.SidebarSection>
	);
}

function Author({ username, onRemove }: { username: string; onRemove: (() => void) | undefined }) {
	const { data: author } = trpc.author.getByUsername.useQuery({ username });

	if (!author) {
		return <li className="rounded-lg border border-light-border bg-white p-2">Loading...</li>;
	}

	return (
		<ImageChip imgUrl={author.imgUrl} onRemove={onRemove}>
			<Link
				href={`/authors/${author.slug}`}
				target="_blank"
				className="font-medium hover:text-secondary"
				rel="noopener noreferrer"
			>
				{author.displayName}
			</Link>
		</ImageChip>
	);
}
