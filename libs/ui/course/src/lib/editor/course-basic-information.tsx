import { CourseFormModel, ExtendedCourseFormModel } from "@self-learning/teaching";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import { CourseSkillForm } from "libs/feature/teaching/src/lib/lesson/forms/skills-form";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { IconButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";

export function CourseBasicInformation() {
	// TODO: should I not use extended version of course form model
	// widen content type to prevent circular path error
	const form = useFormContext<CourseFormModel & { content: unknown[] }>();

	const {
		register,
		control,
		formState: { errors }
	} = form;
	return (
		<div className="m-2 grid w-2/3 grid-cols-1 gap-6 p-2 md:grid-cols-2">
			<div>
				<BasicInfo />
			</div>

			<div>
				<Skills />
				<Selectors />
			</div>
		</div>
	);
}

function Skills() {
	const form = useFormContext<ExtendedCourseFormModel & { content: unknown[] }>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return <CourseSkillForm />;
}

function BasicInfo() {
	const form = useFormContext<CourseFormModel & { content: unknown[] }>();

	const {
		register,
		control,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	return (
		<>
			<LabeledField label="Titel" error={errors.title?.message}>
				<input
					{...register("title")}
					type="text"
					className="textfield"
					placeholder="Der neue Kurs"
					onBlur={slugifyIfEmpty}
				/>
			</LabeledField>
			<LabeledField label="Slug" error={errors.slug?.message}>
				<InputWithButton
					input={
						<input
							className="textfield"
							placeholder="der-neue-Kurs"
							type={"text"}
							{...register("slug")}
						/>
					}
					button={
						<button type="button" className="btn-stroked" onClick={slugifyField}>
							Generieren
						</button>
					}
				/>
			</LabeledField>

			<LabeledField
				label="Beschreibung (TODO: as markdown?)"
				error={errors.subtitle?.message}
			>
				<textarea {...register("description")} placeholder="" className="h-full" />
			</LabeledField>
			<div className="my-5 border-t border-gray-200">
				<AuthorsForm
					subtitle="Die Autoren dieses Kurses."
					emptyString="Für diesen Kurs sind noch keine Autoren hinterlegt."
				/>
			</div>
		</>
	);
}

function Selectors() {
	const [openAddDialog, setOpenAddDialog] = useState(false);

	const handleAdd = () => {
		// TODO
		setOpenAddDialog(false);
	};

	return (
		<div className="my-5">
			<SidebarSectionTitle
				title="Selektoren"
				subtitle="Begrenzung der Menge berücksichtigter Module"
			/>
			<div className="my-2 flex flex-col">
				<IconButton
					type="button"
					data-testid="author-add"
					onClick={() => setOpenAddDialog(true)}
					title="Hinzufügen"
					text="Hinzufügen"
					icon={<PlusIcon className="h-5" />}
				/>
			</div>
		</div>
	);
}
