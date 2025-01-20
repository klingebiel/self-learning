import { Dialog, DialogActions } from "@self-learning/ui/common";
import { LabeledField } from "@self-learning/ui/forms";
import { useState } from "react";
import { Skill } from "@prisma/client";
import { trpc } from "@self-learning/api-client";

export function AddSkillDialog({
	onClose,
	skill,
	selectedSkill,
	repositoryId
}: {
	skill?: Skill;
	selectedSkill?: Skill;
	repositoryId: string;
	onClose: (result?: { name: string; description: string | null; parent?: string }) => void;
}) {
	const [name, setName] = useState(skill?.name ?? "");
	const [description, setDescription] = useState(skill?.description ?? "");
	const [parentSkill, setParentSkill] = useState(selectedSkill?.id);
	const { data: skills } = trpc.skill.getUnresolvedSkillsFromRepo.useQuery({
		repoId: repositoryId
	});

	return (
		<Dialog title="Skill hinzufügen" onClose={onClose}>
			<div className="flex flex-col gap-4">
				<LabeledField label="name">
					<input
						type="text"
						className="textfield"
						value={name}
						onChange={e => setName(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && name.length > 0) {
								onClose({
									name: name,
									description: description,
									parent: parentSkill
								});
							}
						}}
					/>
				</LabeledField>

				<LabeledField label="Beschreibung" optional={true}>
					<input
						type="text"
						className="textfield"
						value={description}
						onChange={e => setDescription(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && name.length > 0) {
								onClose({
									name: name,
									description: description,
									parent: parentSkill
								});
							}
						}}
					/>
				</LabeledField>

				<LabeledField label="Parent">
					<select
						value={parentSkill}
						onChange={e => setParentSkill(e.target.value)}
						onKeyUp={e => {
							if (e.key === "Enter" && name.length > 0) {
								onClose({
									name: name,
									description: description,
									parent: parentSkill
								});
							}
						}}
					>
						<option value=""></option>
						{skills?.map(skill => (
							<option key={skill.id} value={skill.id}>
								{skill.name}
							</option>
						))}
					</select>
				</LabeledField>
			</div>

			<DialogActions onClose={onClose}>
				<button
					type="button"
					className="btn-primary"
					disabled={name.length === 0}
					onClick={() =>
						onClose({
							name: name,
							description: description,
							parent: parentSkill
						})
					}
				>
					Bestätigen
				</button>
			</DialogActions>
		</Dialog>
	);
}
