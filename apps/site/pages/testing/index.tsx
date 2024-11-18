// export default function Test() {
// 	const form = useForm<LearningDiaryPage>({
// 		resolver: zodResolver(learningDiaryPageSchema),
// 		defaultValues: {}
// 	});
// 	const onSubmit = (data: LearningDiaryPage) => {
// 		console.log(data);
// 	};
// 	const watchedValues = form.watch();
// 	useEffect(() => {
// 		console.log("watch", watchedValues);
// 	}, [watchedValues]);
// 	return (
// 		<>
// 			{/* <StarInputTile
// 				name="exampleName"
// 				note="exampleNote"
// 				initialRating={3}
// 				onChange={rating => console.log(rating)}
// 			/> */}
// 			{/* <StarRatingDisplay onChange={} rating={0} /> */}
// 			<FormProvider {...form}>
// 				<form onSubmit={form.handleSubmit(onSubmit)}>
// 					<div className="mb-4">
// 						<Controller
// 							name="learningLocation"
// 							control={form.control}
// 							render={({ field }) => (
// 								<LocationInputTile
// 									initialSelection={field.value}
// 									onChange={field.onChange}
// 								/>
// 							)}
// 						/>
// 					</div>
// 					<div className={"mb-4"}>
// 						<Controller
// 							name="effortLevel"
// 							control={form.control}
// 							render={({ field }) => (
// 								<StarInputTile
// 									name={"Bemühungen:"}
// 									initialRating={field.value}
// 									onChange={field.onChange}
// 								/>
// 							)}
// 						/>
// 					</div>
// 				</form>
// 			</FormProvider>
// 		</>
// 	);
// }

const strategies = [
	{
		id: "1",
		name: "Strategy A",
		techniques: [
			{ id: "tech-1", name: "Technique 1" },
			{ id: "tech-2", name: "Technique 2" }
		]
	},
	{
		id: "2",
		name: "Strategy B",
		techniques: [
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" }
		]
	},
	{
		id: "1",
		name: "Strategy A",
		techniques: [
			{ id: "tech-1", name: "Technique 1" },
			{ id: "tech-2", name: "Technique 2" }
		]
	},
	{
		id: "2",
		name: "Strategy B",
		techniques: [
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" }
		]
	},
	{
		id: "1",
		name: "Strategy A",
		techniques: [
			{ id: "tech-1", name: "Technique 1" },
			{ id: "tech-2", name: "Technique 2" }
		]
	},
	{
		id: "2",
		name: "Strategy B",
		techniques: [
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" },
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" }
		]
	},
	{
		id: "1",
		name: "Strategy A",
		techniques: [
			{ id: "tech-1", name: "Technique 1" },
			{ id: "tech-2", name: "Technique 2", score: 3 }
		]
	},
	{
		id: "2",
		name: "Strategy B",
		techniques: [
			{ id: "tech-3", name: "Techniqusadjkashdukas hdasjkhdajksdhkajsdh e 3", score: 1 },
			{ id: "tech-4", name: "Technique 4" },
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" },
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" },
			{ id: "tech-3", name: "Technique 3" },
			{ id: "tech-4", name: "Technique 4" }
		]
	}
	// Add more strategies...
];

export default function Test() {
	const handleTechniqueClick = (id: any) => {
		console.log("Clicked on technique:", id);
	};
	return <div></div>;
}
