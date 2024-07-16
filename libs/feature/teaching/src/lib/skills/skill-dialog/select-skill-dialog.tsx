/* eslint-disable react/jsx-no-useless-fragment */
import { SkillFormModel } from "@self-learning/types";
import { Dialog, DialogActions, LoadingBox, OnDialogCloseFn } from "@self-learning/ui/common";
import { trpc } from "@self-learning/api-client";
import { memo, useEffect, useState } from "react";
import { SearchField } from "@self-learning/ui/forms";
import { useTranslation } from "react-i18next";

export function SelectSkillDialog({
	onClose,
	repositoryId
}: {
	onClose: OnDialogCloseFn<SkillFormModel[]>;
	repositoryId: string;
}) {
	return <SkillModal onClose={onClose} repositoryId={repositoryId} />;
}

function SkillModal({
	onClose,
	repositoryId
}: {
	onClose: OnDialogCloseFn<SkillFormModel[]>;
	repositoryId: string;
}) {
	const {t} = useTranslation();
	const { data: skills, isLoading } = trpc.skill.getUnresolvedSkillsFromRepo.useQuery({
		repoId: repositoryId
	});

	return (
		<Dialog onClose={() => onClose(undefined)} title={t("add_skill_dialog_title")}>
			{isLoading ? (
				<LoadingBox />
			) : (
				<>
					{skills && (
						<SelectSkillForm
							onClose={onClose}
							//skills is missing some properties here
							skills={skills as SkillFormModel[]}
						/>
					)}
				</>
			)}
		</Dialog>
	);
}

function SelectSkillForm({
	onClose,
	skills
}: {
	onClose: OnDialogCloseFn<SkillFormModel[]>;
	skills: SkillFormModel[];
}) {
	const [search, setSearch] = useState("");
	const [checkBoxMap, setCheckBoxMap] = useState(new Map<SkillFormModel, boolean>());
	useEffect(() => {
		const map = new Map<SkillFormModel, boolean>();
		skills.forEach(skill => {
			map.set(skill, false);
		});
		setCheckBoxMap(map);
	}, [skills]);

	const setSkill = (skill: SkillFormModel) => {
		checkBoxMap.set(skill, !checkBoxMap.get(skill));
	};

	const filteredSkills =
		search !== ""
			? skills.filter(skill => skill.name.toLowerCase().includes(search.toLowerCase()))
			: skills;
	const {t} = useTranslation();

	return (
		<>
			<SearchField
				placeholder={t("search_for_skill")}
				onChange={e => {
					setSearch(e.target.value);
				}}
			/>
			<div className="flex flex-col justify-between overflow-auto">
				<section className="flex h-64 flex-col rounded-lg border border-light-border p-4">
					<div className="flex flex-col">
						{skills.length === 0 && <p>{t("no_skills_available")}</p>}
						{skills.length > 0 && (
							<>
								{filteredSkills
									.sort((a, b) => a.name.localeCompare(b.name))
									.map((skill, index) => (
										<>
											<span
												key={"span: " + skill.id + index}
												className="flex items-center gap-2"
											>
												<SkillElementMemorized
													key={skill.id + index}
													skill={skill}
													value={checkBoxMap.get(skill) ?? false}
													setSkill={setSkill}
												/>
											</span>
										</>
									))}
							</>
						)}
					</div>
				</section>
			</div>
			<DialogActions onClose={onClose}>
				<button
					className="btn-primary"
					onClick={() => {
						onClose(skills.filter(skill => checkBoxMap.get(skill)));
					}}
				>
					{t("save")}
				</button>
			</DialogActions>
		</>
	);
}

const SkillElementMemorized = memo(SkillElement);

function SkillElement({
	skill,
	setSkill,
	value
}: {
	skill: SkillFormModel;
	setSkill: (skill: SkillFormModel) => void;
	value: boolean;
}) {
	const [checked, setChecked] = useState(value);

	useEffect(() => {
		setChecked(value);
	}, [value]);

	return (
		<>
			<input
				id={"checkbox:" + skill.id}
				type={"checkbox"}
				className="checkbox"
				checked={checked}
				onChange={() => {
					setChecked(!checked);
					setSkill(skill);
				}}
			/>
			<label htmlFor={"checkbox:" + skill.id} className="text-sm font-semibold">
				{skill.name}
			</label>
		</>
	);
}
