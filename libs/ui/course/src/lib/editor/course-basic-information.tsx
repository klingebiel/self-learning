import { ExtendedCourseFormValues } from "@self-learning/teaching";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { InputWithButton, LabeledField, useSlugify } from "@self-learning/ui/forms";
import { AuthorsForm } from "libs/feature/teaching/src/lib/author/authors-form";
import { CourseSkillForm } from "libs/feature/teaching/src/lib/lesson/forms/skills-form";
import { SidebarSectionTitle } from "libs/ui/forms/src/lib/form-container";
import { IconButton } from "@self-learning/ui/common";
import { PlusIcon } from "@heroicons/react/24/solid";
import { trpc } from "@self-learning/api-client";

export function CourseBasicInformation() {
	const form = useFormContext<ExtendedCourseFormValues>();

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
	const form = useFormContext<ExtendedCourseFormValues>();
	const {
		register,
		control,
		formState: { errors }
	} = form;
	return <CourseSkillForm />;
}

function BasicInfo() {
	const form = useFormContext<ExtendedCourseFormValues>();

	const {
		register,
		setValue,
		formState: { errors }
	} = form;

	const { slugifyField, slugifyIfEmpty } = useSlugify(form, "title", "slug");

	let { data: subjects } = trpc.subject.getAllSubjects.useQuery();
	if (!subjects) {
		subjects = [];
	}

	let { data: specializations } = trpc.specialization.getAll.useQuery();
	if (!specializations) {
		specializations = [];
	}

	const onSubjectChange = (subjectId: string) => {
		setValue("subjectId", subjectId);
	};
	const onSpecializationChange = (specializationId: string) => {
		setValue("specializationId", specializationId);
	};

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

			<LabeledField label="Fachgebiet" error={errors.subtitle?.message}>
				<SubjectDropDown subjects={subjects} onChange={onSubjectChange} />
			</LabeledField>

			<LabeledField label="Spezialisierung" error={errors.subtitle?.message}>
				<SpecializationDropDown
					specializations={specializations}
					onChange={onSpecializationChange}
				/>
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

type subject = {
	subjectId: string;
	title: string;
};

function SubjectDropDown({
	subjects,
	onChange
}: {
	subjects: subject[];
	onChange: (id: string) => void;
}) {
	const [selectedSubject, setSelectedSubject] = useState<string>(subjects?.[0]?.subjectId ?? "");

	const changeDisplaySelectedRepository = (id: string) => {
		setSelectedSubject(id);
	};

	useEffect(() => {
		onChange(selectedSubject);
	}, [onChange, selectedSubject]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSubject ?? subjects[0].subjectId}
				onChange={e => {
					changeDisplaySelectedRepository(e.target.value);
				}}
			>
				{subjects.map(subject => (
					<option key={subject.subjectId} value={subject.subjectId}>
						{subject.title}
					</option>
				))}
			</select>
		</div>
	);
}

type specialization = {
	specializationId: string;
	title: string;
};

function SpecializationDropDown({
	specializations,
	onChange
}: {
	specializations: specialization[];
	onChange: (id: string) => void;
}) {
	const [selectedSpecialization, setSelectedSpecialization] = useState<string>(
		specializations?.[0]?.specializationId ?? ""
	);

	const changeDisplaySelectedRepository = (id: string) => {
		setSelectedSpecialization(id);
	};

	useEffect(() => {
		onChange(selectedSpecialization);
	}, [onChange, selectedSpecialization]);

	return (
		<div className="flex flex-col">
			<select
				className="textfield"
				value={selectedSpecialization ?? specializations[0].specializationId}
				onChange={e => {
					changeDisplaySelectedRepository(e.target.value);
				}}
			>
				{specializations.map(specialization => (
					<option
						key={specialization.specializationId}
						value={specialization.specializationId}
					>
						{specialization.title}
					</option>
				))}
			</select>
		</div>
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
