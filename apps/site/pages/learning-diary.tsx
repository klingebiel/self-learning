import { CheckIcon, PlusIcon, XIcon } from "@heroicons/react/outline";
import { authOptions } from "@self-learning/api";
import { database } from "@self-learning/database";
import { ResolvedValue, getStrategyNameByType } from "@self-learning/types";
import { SidebarEditorLayout } from "@self-learning/ui/layouts";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ReactElement, useState } from "react";
import { Tab } from "@headlessui/react";
import { GoalType, Lesson } from "@prisma/client";
import {
	EntryEditor,
	EntryFormModel,
	GoalEditor,
	GoalFormModel,
	Lessons
} from "@self-learning/learning-diary";
import { trpc } from "libs/data-access/api-client/src/lib/trpc";
import {
	Paginator,
	Table,
	TableDataColumn,
	TableHeaderColumn,
	showToast
} from "@self-learning/ui/common";
import { useRouter } from "next/router";

type CompletedLesson = ResolvedValue<typeof getCompletedLessonsThisWeek>[0];
type LearningGoal = ResolvedValue<typeof getGoals>[0];
type DiaryEntry = ResolvedValue<typeof getEntries>[0];

type SelectEntryFunction = (id: string) => void;
type SelectCompletedLessonFunction = (lessonId: string, completedLessonId: number) => void;

type LearningDiaryProps = {
	completedLessons: {
		today: CompletedLesson[];
		yesterday: CompletedLesson[];
		week: CompletedLesson[];
	};
	goals: LearningGoal[];
	entries: {
		today: DiaryEntry[];
		yesterday: DiaryEntry[];
		week: DiaryEntry[];
	};
};

function classNames(...classes: any[]) {
	return classes.filter(Boolean).join(" ");
}

export const getServerSideProps: GetServerSideProps<LearningDiaryProps> = async ctx => {
	const session = await getServerSession(ctx.req, ctx.res, authOptions);

	if (!session?.user?.name) {
		return { redirect: { destination: "/login?callbackUrl=learning-diary", permanent: false } };
	}
	const found = await database.learningDiary.findUnique({
		where: { username: session?.user?.name },
		select: { username: true }
	});

	if (found === null) {
		await database.learningDiary.create({
			data: { username: session?.user?.name }
		});
	}

	const [completedLessons, goals, entries] = await Promise.all([
		JSON.parse(JSON.stringify(await getCompletedLessonsThisWeek(session.user.name))),
		JSON.parse(JSON.stringify(await getGoals(session.user.name))),
		JSON.parse(JSON.stringify(await getEntries(session.user.name)))
	]);

	return {
		props: {
			goals: goals,
			completedLessons: groupCompletedLessons(completedLessons),
			entries: groupEntries(entries)
		}
	};
};

function getGoals(username: string) {
	return database.learningGoal.findMany({
		select: {
			id: true,
			achieved: true,
			priority: true,
			type: true,
			actualValue: true,
			targetValue: true,
			createdAt: true,
			description: true,
			diaryID: true,
			learningTime: true
		},
		orderBy: {
			priority: "asc"
		},
		where: {
			diaryID: username
		}
	});
}

function getEntries(username: string) {
	return database.diaryEntry.findMany({
		include: {
			learningStrategies: true,
			completedLesson: {
				include: {
					lesson: true,
					course: true
				}
			},
			lesson: true
		},
		where: {
			diaryID: username
		}
	});
}

async function getCompletedLessonsThisWeek(username: string) {
	return database.completedLesson.findMany({
		select: {
			completedLessonId: true,
			createdAt: true,
			course: {
				select: {
					title: true,
					slug: true
				}
			},
			lesson: {
				select: {
					lessonId: true,
					title: true,
					slug: true
				}
			}
		},
		where: {
			AND: {
				username,
				diaryEntry: null
			}
		}
	});
}

function groupCompletedLessons(
	completedLessons: CompletedLesson[]
): LearningDiaryProps["completedLessons"] {
	const today = [];
	const yesterday = [];
	const week = [];

	for (const lesson of completedLessons) {
		if (isToday(parseISO(new Date(lesson.createdAt).toISOString()))) {
			today.push(lesson);
		} else if (isYesterday(parseISO(new Date(lesson.createdAt).toISOString()))) {
			yesterday.push(lesson);
		} else {
			week.push(lesson);
		}
	}
	return { today, yesterday, week };
}

function groupEntries(entries: DiaryEntry[]): LearningDiaryProps["entries"] {
	const today = [];
	const yesterday = [];
	const week = [];

	for (const entry of entries) {
		if (isToday(parseISO(new Date(entry.createdAt).toISOString()))) {
			today.push(entry);
		} else if (isYesterday(parseISO(new Date(entry.createdAt).toISOString()))) {
			yesterday.push(entry);
		} else {
			week.push(entry);
		}
	}
	return { today, yesterday, week };
}

function Goal({
	id,
	description = "",
	priority,
	targetValue,
	actualValue,
	achieved
}: Readonly<{
	id: string;
	description: string;
	priority: number;
	targetValue: number;
	actualValue: number;
	achieved: boolean;
}>) {
	const { mutateAsync: incrementActualValueForGoal } =
		trpc.learningDiary.incrementActualValueForGoal.useMutation();
	const { mutateAsync: markGoalAsAchieved } = trpc.learningDiary.markGoalAsAchieved.useMutation();
	const { mutateAsync: deleteGoal } = trpc.learningDiary.deleteGoal.useMutation();
	const router = useRouter();

	async function incrementGoal() {
		actualValue = actualValue + 1;

		const result = await incrementActualValueForGoal({
			id: id,
			actualValue: actualValue
		});
		console.log(result);

		if (actualValue == targetValue) {
			const result = await markGoalAsAchieved({ id: id });
			console.log(result);
		}
		router.replace(router.asPath);
	}

	async function markAsAchievedGoal() {
		const result = await markGoalAsAchieved({ id: id });
		console.log(result);
		router.replace(router.asPath);
	}

	async function delGoal() {
		const result = await deleteGoal({ id: id });
		console.log(result);
		router.replace(router.asPath);
	}

	return (
		<div className="flex flex-row items-center">
			{targetValue > 0 && (
				<div className="mx-auto flex w-full flex-row justify-between gap-4">
					<div>
						{description} {actualValue} / {targetValue} (Priorität: {priority})
					</div>
					{!achieved && (
						<button
							id={id}
							onClick={incrementGoal}
							className="btn-small place-content-center items-center"
							title="Ist Wert erhöhen"
						>
							<PlusIcon className="h-3 w-3" />
						</button>
					)}
				</div>
			)}
			{targetValue == 0 && (
				<div className="mx-auto flex w-full flex-row justify-between gap-4">
					<div>
						{description} (Priorität: {priority})
					</div>
					{!achieved && (
						<button
							onClick={markAsAchievedGoal}
							className="btn-small place-content-center items-center"
							title="Als erfüllt markieren"
						>
							<CheckIcon className="h-3 w-3" />
						</button>
					)}
				</div>
			)}
			<button
				onClick={delGoal}
				className="btn-small place-content-center items-center"
				title="Ziel Löschen"
			>
				<XIcon className="h-3 w-3" />
			</button>
		</div>
	);
}

function getGoalType(type: GoalType) {
	let out: string;
	switch (type) {
		case "NUMBEROFLESSONS":
			out = "Abgeschlossene Lerneinheiten pro Woche:";
			break;
		case "NUMBEROFQUIZATTEMPTS":
			out = "Absolvierte Quizversuche pro Woche:";
			break;
		default:
			out = "error";
			break;
	}
	return out;
}

function TabGoals({ goals }: Readonly<LearningDiaryProps>) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showForm, setShowForm] = useState(false);
	const { mutateAsync: createGoal } = trpc.learningDiary.createGoal.useMutation();
	const router = useRouter();

	async function onConfirm(goal: GoalFormModel) {
		if (goal.description === "") {
			goal.description = getGoalType(goal.type);
		}
		try {
			const result = await createGoal(goal);
			console.log(result);
			showToast({
				type: "success",
				title: "Ziel erstellt!",
				subtitle: ""
			});
			setShowForm(false);
			router.replace(router.asPath);
		} catch (error) {
			showToast({
				type: "error",
				title: "Fehler",
				subtitle:
					"Das Ziel konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
			});
		}
	}

	const toggleShowForm = () => {
		setShowForm(!showForm);
	};
	return (
		<section className="flex w-full flex-col gap-8 p-4">
			<span className="text-lg font-semibold text-light">Meine Ziele</span>

			<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className="flex w-full flex-wrap gap-4 border-b border-light-border">
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Offen
					</Tab>
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Erledigt
					</Tab>
				</Tab.List>
				<Tab.Panels className="flex flex-grow flex-col gap-12">
					<Tab.Panel>
						<ul className="flex flex-col gap-1 text-sm">
							{goals
								.filter(i => i.achieved === false)
								.map(
									({
										id,
										description,
										priority,
										targetValue,
										actualValue,
										achieved
									}) => (
										<Goal
											key={id}
											id={id}
											description={description}
											priority={priority}
											targetValue={targetValue}
											actualValue={actualValue}
											achieved={achieved}
										/>
									)
								)}
						</ul>
					</Tab.Panel>
					<Tab.Panel>
						<ul className="flex flex-col gap-2 text-sm">
							{goals
								.filter(i => i.achieved === true)
								.map(
									({
										id,
										description,
										priority,
										targetValue,
										actualValue,
										achieved
									}) => (
										<Goal
											key={id}
											id={id}
											description={description}
											priority={priority}
											targetValue={targetValue}
											actualValue={actualValue}
											achieved={achieved}
										/>
									)
								)}
						</ul>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
			<div>
				{!showForm && (
					<button className="btn-primary w-full" onClick={toggleShowForm}>
						Neues Ziel erstellen
					</button>
				)}

				{showForm && (
					<GoalEditor
						onConfirm={onConfirm}
						goal={{
							id: "",
							description: "",
							achieved: false,
							priority: 1,
							targetValue: 0,
							actualValue: 0,
							type: "USERSPECIFIC"
						}}
					/>
				)}
			</div>
			{showForm && (
				<button className="btn-primary w-full" onClick={toggleShowForm}>
					Abbrechen
				</button>
			)}
		</section>
	);
}

function StrategyOverviews() {
	const { data: strategyOverviews } = trpc.learningDiary.getStrategyOverview.useQuery();
	const { data: userSpecificStrategyOverviews } =
		trpc.learningDiary.getUserSpecificStrategyOverview.useQuery();
	return (
		<section className="flex flex-col gap-8  p-4">
			<div className="flex h-full flex-col justify-between gap-4">
				<Table
					head={
						<>
							<TableHeaderColumn>Strategy</TableHeaderColumn>
							<TableHeaderColumn>Vertrauensbewertung (avg):</TableHeaderColumn>
							<TableHeaderColumn>Summe der Nutzungen</TableHeaderColumn>
						</>
					}
				>
					{strategyOverviews?.map(({ type, _avg, _count }) => (
						<tr key={type}>
							<TableDataColumn>
								<span className="text-light">{getStrategyNameByType(type)}</span>
							</TableDataColumn>
							<TableDataColumn>
								<span className="text-light">{_avg.confidenceRating}</span>
							</TableDataColumn>

							<TableDataColumn>
								<span className="text-light">{_count.type}</span>
							</TableDataColumn>
						</tr>
					))}
					{userSpecificStrategyOverviews?.map(({ notes, _avg, _count }) => (
						<tr key={notes}>
							<TableDataColumn>
								<span className="text-light">{notes}</span>
							</TableDataColumn>
							<TableDataColumn>
								<span className="text-light">{_avg.confidenceRating}</span>
							</TableDataColumn>

							<TableDataColumn>
								<span className="text-light">{_count.type}</span>
							</TableDataColumn>
						</tr>
					))}
				</Table>
			</div>
		</section>
	);
}

function CompletedSection({
	selectCompletedLesson,
	title,
	subtitle,
	completedLessons
}: Readonly<{
	selectCompletedLesson: SelectCompletedLessonFunction;
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
	completedLessons: CompletedLesson[];
}>) {
	return (
		<section className="flex flex-col gap-2">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{completedLessons.length}</span>)}
				</span>
				<hr />
			</div>
			<ul className="mb-4 flex flex-col gap-2 text-sm">
				{completedLessons.map(({ lesson, createdAt, completedLessonId }) => (
					<CompletedLessonList
						key={lesson.lessonId}
						lessonId={lesson.lessonId}
						completedLessonId={completedLessonId}
						title={lesson.title}
						date={createdAt}
						selectCompletedLesson={selectCompletedLesson}
					/>
				))}
			</ul>
		</section>
	);
}
function CompletedSectionPage({
	selectCompletedLesson,
	title,
	subtitle
}: Readonly<{
	selectCompletedLesson: SelectCompletedLessonFunction;
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
}>) {
	const router = useRouter();
	const { page = 1 } = router.query;
	const date = new Date();
	date.setDate(date.getDate() - 2);
	const { data } = trpc.learningDiary.findManyCompletedLessons.useQuery(
		{ date: date.toISOString(), page: Number(page) },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);
	return (
		<section className="flex flex-col gap-2">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{data?.result.length}</span>)}
				</span>
				<hr />
			</div>
			<ul className="mb-4 flex flex-col gap-2 text-sm">
				{data?.result.map(({ lesson, createdAt, completedLessonId }) => (
					<CompletedLessonList
						key={lesson.lessonId}
						lessonId={lesson.lessonId}
						completedLessonId={completedLessonId}
						title={lesson.title}
						date={JSON.parse(JSON.stringify(createdAt))}
						selectCompletedLesson={selectCompletedLesson}
					/>
				))}
			</ul>
			{data?.result && <Paginator pagination={data} url={`/admin/lessons?title=`} />}
		</section>
	);
}
function EntriesSection({
	selectEntry,
	title,
	subtitle,
	entries
}: Readonly<{
	selectEntry: SelectEntryFunction;
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
	entries: DiaryEntry[];
}>) {
	return (
		<section className="flex flex-col gap-2">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{entries.length}</span>)}
				</span>
				<hr />
			</div>
			<ul className="mb-4 flex flex-col gap-2 text-sm">
				{entries.map(({ id, title, completedLesson, lesson, createdAt }) => (
					<EntriesList
						key={id}
						title={title}
						id={id}
						lesson={lesson}
						completedLesson={completedLesson}
						createdAt={createdAt}
						selectEntry={selectEntry}
					/>
				))}
			</ul>
		</section>
	);
}
function EntriesSectionPage({
	selectEntry,
	title,
	subtitle
}: Readonly<{
	selectEntry: SelectEntryFunction;
	title: string;
	subtitle: (amount: ReactElement) => ReactElement;
}>) {
	const router = useRouter();
	const { page = 1 } = router.query;
	const date = new Date();
	date.setDate(date.getDate() - 2);
	const { data } = trpc.learningDiary.findManyEntries.useQuery(
		{ date: date.toISOString(), page: Number(page) },
		{
			staleTime: 10_000,
			keepPreviousData: true
		}
	);
	return (
		<section className="flex flex-col gap-2">
			<div className="flex flex-col gap-1">
				<span className="font-semibold">{title}</span>
				<span className="text-xs text-light">
					{subtitle(<span className="font-semibold">{data?.result.length}</span>)}
				</span>
				<hr />
			</div>
			<ul className="mb-4 flex flex-col gap-2 text-sm">
				{data?.result.map(({ id, title, completedLesson, lesson, createdAt }) => (
					<EntriesList
						key={id}
						title={title}
						id={id}
						lesson={JSON.parse(JSON.stringify(lesson))}
						completedLesson={JSON.parse(JSON.stringify(completedLesson))}
						createdAt={JSON.parse(JSON.stringify(createdAt))}
						selectEntry={selectEntry}
					/>
				))}
			</ul>
			{data?.result && <Paginator pagination={data} url={`/admin/lessons?title=`} />}
		</section>
	);
}

function EntriesList({
	id,
	title,
	completedLesson,
	lesson,
	createdAt,
	selectEntry
}: Readonly<{
	id: string;
	title: string;
	completedLesson: CompletedLesson | null;
	lesson: Lesson | null;
	createdAt: Date;
	selectEntry: SelectEntryFunction;
}>) {
	let info: string;
	let isCompletedLessons = false;
	if (completedLesson != null) {
		info =
			'Eintrag für "' +
			completedLesson.lesson.title +
			'" vom ' +
			format(
				parseISO(new Date(completedLesson.createdAt).toISOString()),
				"dd/MM/yyyy (HH:mm"
			) +
			"Uhr)";
		isCompletedLessons = true;
	} else if (lesson != null) {
		info =
			'Eintrag für "' +
			lesson.title +
			'" vom ' +
			format(parseISO(new Date(createdAt).toISOString()), "dd/MM/yyyy (HH:mm") +
			" Uhr)";
	} else {
		info =
			"Eintrag vom " +
			format(parseISO(new Date(createdAt).toISOString()), "dd/MM/yyyy (HH:mm") +
			"Uhr)";
	}
	return (
		<li className="border-bottom:1px flex flex-wrap items-center justify-between gap-2">
			<div className="mx-auto w-full max-w-md">
				<button
					className="link w-full cursor-pointer hover:bg-emerald-500 hover:text-white"
					onClick={() => selectEntry(id)}
				>
					<div className="mx-auto mt-2 mb-2 flex w-full max-w-md flex-col items-start">
						<div className="flex w-full max-w-md flex-row justify-between">
							<span className="text-base font-semibold">{title}</span>{" "}
							{isCompletedLessons && <CheckIcon className="h-5 w-5" />}
						</div>
						<span className="text-xs">{info}</span>
					</div>
				</button>
			</div>
		</li>
	);
}

function CompletedLessonList({
	lessonId,
	completedLessonId,
	title,
	date,
	selectCompletedLesson
}: Readonly<{
	lessonId: string;
	completedLessonId: number;
	title: string;
	date: Date;
	selectCompletedLesson: SelectCompletedLessonFunction;
}>) {
	return (
		<li className="flex flex-wrap items-center justify-between">
			<div className="mx-auto w-full max-w-md">
				<button
					className="link  w-full cursor-pointer hover:bg-emerald-500 hover:text-white"
					onClick={() => selectCompletedLesson(lessonId, completedLessonId)}
				>
					<div className=" mx-auto mt-2 mb-2 flex w-full max-w-md flex-col items-start">
						<span className="text-base font-semibold">{title}</span>
						<span className="text-xs">
							{"Abgeschlossene Lerneinheit " +
								"vom " +
								format(
									parseISO(new Date(date).toISOString()),
									"dd/MM/yyyy (HH:mm"
								) +
								"Uhr)"}
						</span>
					</div>
				</button>
			</div>
		</li>
	);
}

export function TabGroupEntries({
	selectEntry,
	selectCompletedLesson,
	completedLessons,
	entries
}: Readonly<{
	selectEntry: SelectEntryFunction;
	selectCompletedLesson: SelectCompletedLessonFunction;
	completedLessons: {
		today: CompletedLesson[];
		yesterday: CompletedLesson[];
		week: CompletedLesson[];
	};
	entries: {
		today: DiaryEntry[];
		yesterday: DiaryEntry[];
		week: DiaryEntry[];
	};
}>) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const count =
		completedLessons.today.length +
		completedLessons.week.length +
		completedLessons.yesterday.length;
	return (
		<section className="flex w-full flex-col gap-8 p-4">
			<span className="text-lg font-semibold text-light">Meine Einträge</span>
			<button className="btn-primary w-full" onClick={() => selectEntry("")}>
				Neuen Eintrag erstellen
			</button>

			<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
				<Tab.List className="flex w-full flex-wrap border-b border-light-border">
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Alle
					</Tab>
					<Tab
						className={({ selected }) =>
							classNames(
								"mx-auto px-2 py-2 font-semibold",
								selected ? "text-secondary" : "text-light"
							)
						}
					>
						Zu ergänzen{" "}
						{count > 0 ? <span className="text-emerald-500">({count})</span> : ""}
					</Tab>
				</Tab.List>
				<Tab.Panels className="flex-grow flex-col gap-12">
					<Tab.Panel>
						<section>
							<EntriesSection
								selectEntry={selectEntry}
								title="Heute"
								subtitle={amount => <>Deine heutigen Tagebucheinträge: {amount}.</>}
								entries={entries.today}
							/>
							<EntriesSection
								selectEntry={selectEntry}
								title="Gestern"
								subtitle={amount => (
									<>Deine gestrigen Tagebucheinträge: {amount}.</>
								)}
								entries={entries.yesterday}
							/>
							<EntriesSectionPage
								selectEntry={selectEntry}
								title="Alle Einträge"
								subtitle={amount => (
									<>Deine restlichen Tagebucheinträge: {amount}.</>
								)}
							/>
						</section>
					</Tab.Panel>
					<Tab.Panel>
						<section>
							<CompletedSection
								selectCompletedLesson={selectCompletedLesson}
								title="Heute"
								subtitle={amount => (
									<>Du hast heute {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.today}
							/>
							<CompletedSection
								selectCompletedLesson={selectCompletedLesson}
								title="Gestern"
								subtitle={amount => (
									<>Du hast gestern {amount} Lerneinheiten bearbeitet.</>
								)}
								completedLessons={completedLessons.yesterday}
							/>
							<CompletedSectionPage
								selectCompletedLesson={selectCompletedLesson}
								title="Alle Einträge"
								subtitle={amount => (
									<>Du hast {amount} weitere Lerneinheiten bearbeitet.</>
								)}
							/>
						</section>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</section>
	);
}

function Entry(diaryEntry: DiaryEntry) {
	function fetchCourseSlugsByUser() {
		const { data: enrollments } = trpc.enrollment.getEnrollments.useQuery();
		const course: string[] = [];

		if (enrollments)
			enrollments.forEach((element: { course: { slug: string } }) => {
				course.push(element.course.slug);
			});
		return course;
	}
	const { mutateAsync: createDiaryEntry } = trpc.learningDiary.createDiaryEntry.useMutation();
	const { mutateAsync: updateDiaryEntry } = trpc.learningDiary.updateDiaryEntry.useMutation();

	const { data: inputDiaryEntry } = trpc.learningDiary.getEntryForEdit.useQuery({
		entryId: diaryEntry.id
	});

	const slugs = fetchCourseSlugsByUser();
	const { data: lessonsData } = trpc.learningDiary.getLessons.useQuery({ slugs });
	const lessons: Lessons[] = [];
	if (lessonsData ?? false) {
		lessonsData?.forEach((ele: { lessonId: string; title: string }) => {
			lessons.push({ id: ele.lessonId, name: ele.title });
		});
	}
	const router = useRouter();

	async function onConfirm(entryForm: EntryFormModel) {
		if (entryForm.lessonId == "") entryForm.lessonId = null;
		if (diaryEntry.id != "") {
			try {
				const result = await updateDiaryEntry({
					id: diaryEntry.id,
					title: diaryEntry.title,
					completedLessonId: entryForm.completedLessonId,
					distractions: entryForm.distractions,
					duration: entryForm.duration,
					efforts: entryForm.efforts,
					lessonId: entryForm.lessonId,
					notes: entryForm.notes,
					learningStrategies: entryForm.learningStrategies
				});
				console.log(result);
				showToast({
					type: "success",
					title: "Eintrag wurde bearbeitet!",
					subtitle: ""
				});

				router.replace(router.asPath);
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle:
						"Der Eintrag konnte nicht bearbeitet werden. Siehe Konsole für mehr Informationen."
				});
			}
		} else {
			entryForm.id = null;
			try {
				const result = await createDiaryEntry(entryForm);
				showToast({
					type: "success",
					title: "Eintrag erstellt!",
					subtitle: result.createdAt
				});
				router.replace(router.asPath);
			} catch (error) {
				showToast({
					type: "error",
					title: "Fehler",
					subtitle:
						"Der Eintrag konnte nicht erstellt werden. Siehe Konsole für mehr Informationen."
				});
			}
		}
	}
	return (
		<div>
			{!inputDiaryEntry ? (
				<EntryEditor
					onConfirm={onConfirm}
					entry={{
						id: "",
						title: "",
						distractions: "",
						completedLessonId: diaryEntry.completedLessonId,
						notes: "",
						duration: 0,
						efforts: "",
						lessonId: diaryEntry.lessonId,
						learningStrategies: []
					}}
					lessons={lessons}
				/>
			) : (
				<EntryEditor
					onConfirm={onConfirm}
					entry={{
						id: inputDiaryEntry.id,
						title: inputDiaryEntry.title,
						distractions: inputDiaryEntry.distractions,
						completedLessonId: inputDiaryEntry.completedLessonId,
						notes: inputDiaryEntry.notes,
						duration: inputDiaryEntry.duration,
						efforts: inputDiaryEntry.efforts,
						lessonId: inputDiaryEntry.lessonId,
						learningStrategies: inputDiaryEntry.learningStrategies
					}}
					lessons={lessons}
				/>
			)}
		</div>
	);
}

export default function LearningDiary(props: Readonly<LearningDiaryProps>) {
	const [selectedEntry, setSelectedEntry] = useState("");
	const [selectedLesson, setSelectedLesson] = useState("");
	const [selectedCompletedLesson, setSelectedCompletedLesson] = useState(-1);
	function selectEntry(id: string): void {
		setSelectedEntry(id);
		setSelectedCompletedLesson(-1);
		setSelectedLesson("");
	}
	function selectCompletedLesson(lessonId: string, completedLessonId: number): void {
		setSelectedCompletedLesson(completedLessonId);
		setSelectedLesson(lessonId);
		setSelectedEntry("");
	}

	return (
		<div className="bg-gray-50">
			<SidebarEditorLayout
				sidebar={
					<>
						<h1 className="mb-16 text-5xl">Mein Lerntagebuch</h1>

						<TabGroupEntries
							selectEntry={selectEntry}
							selectCompletedLesson={selectCompletedLesson}
							completedLessons={props.completedLessons}
							entries={props.entries}
						/>
					</>
				}
			>
				<div className="mx-auto flex w-full  max-w-full flex-row justify-between gap-4">
					<div className="flex w-full flex-col gap-5 p-4">
						<Entry
							id={selectedEntry}
							title={""}
							diaryID={""}
							distractions={null}
							efforts={null}
							notes={null}
							completedLessonId={selectedCompletedLesson}
							completedLesson={null}
							learningStrategies={[]}
							lessonId={selectedLesson}
							createdAt={new Date()}
							lesson={null}
							duration={null}
						/>
					</div>
					<div className="flex w-full flex-col gap-5">
						<TabGoals
							goals={props.goals}
							completedLessons={{
								today: [],
								yesterday: [],
								week: []
							}}
							entries={{
								today: [],
								yesterday: [],
								week: []
							}}
						/>
						<StrategyOverviews />
					</div>
				</div>
			</SidebarEditorLayout>
		</div>
	);
}
