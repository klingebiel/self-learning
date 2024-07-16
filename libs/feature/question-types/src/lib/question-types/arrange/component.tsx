import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { MarkdownViewer } from "@self-learning/ui/forms";
import { Fragment } from "react";
import { Feedback } from "../../feedback";
import { useQuestion } from "../../use-question-hook";
import { useTranslation } from "react-i18next";

export default function ArrangeQuestion() {
	const { t } = useTranslation();
	const { answer, setAnswer, evaluation } = useQuestion("arrange");

	return (
		<>
			<DragDropContext
				onDragEnd={result => {
					console.log(result);
					const { source, destination } = result;

					if (!destination) return;

					setAnswer(prev => {
						const value = { ...prev.value };
						const [removed] = value[source.droppableId].splice(source.index, 1);
						value[destination.droppableId].splice(destination.index, 0, removed);
						return { type: "arrange", value };
					});
				}}
			>
				<ul className="grid auto-cols-fr grid-flow-col gap-4">
					{Object.entries(answer.value).map(([containerId, items]) => (
						// eslint-disable-next-line react/jsx-no-useless-fragment
						<Fragment key={containerId}>
							{containerId === "_init" ? null : (
								<li
									key={containerId}
									className="flex min-w-[256px] flex-col gap-4 rounded-lg bg-gray-200 p-4"
								>
									<span className="font-semibold">{containerId}</span>

									<Droppable
										droppableId={containerId.toString()}
										isDropDisabled={!!evaluation}
									>
										{provided => (
											<ul
												ref={provided.innerRef}
												{...provided.droppableProps}
												className="flex h-full min-h-[128px] flex-col gap-4 rounded-lg bg-gray-100 p-4"
											>
												{items.map((item, index) => (
													<Draggable
														key={item.id}
														draggableId={item.id}
														index={index}
														isDragDisabled={!!evaluation}
													>
														{provided => (
															<li
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																className="prose prose-emerald h-fit w-fit max-w-[50ch] rounded-lg bg-white p-4 shadow-lg"
															>
																<MarkdownViewer
																	content={item.content}
																/>
															</li>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</ul>
										)}
									</Droppable>
								</li>
							)}
						</Fragment>
					))}
				</ul>

				<div className="flex min-h-[128px] flex-col gap-4 rounded-lg bg-gray-200 p-4">
					<span className="font-semibold">{t("not_assigned")}</span>

					<Droppable
						droppableId={"_init"}
						direction="horizontal"
						isDropDisabled={!!evaluation}
					>
						{provided => (
							<ul
								ref={provided.innerRef}
								{...provided.droppableProps}
								className="flex min-h-[128px] flex-wrap gap-4 rounded-lg border-white bg-gray-100 p-4"
							>
								{answer.value["_init"].map((item, index) => (
									<Draggable
										key={item.id}
										draggableId={item.id}
										index={index}
										isDragDisabled={!!evaluation}
									>
										{provided => (
											<li
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className="prose prose-emerald h-fit w-fit max-w-[50ch] rounded-lg bg-white p-4 shadow-lg"
											>
												<MarkdownViewer content={item.content} />
											</li>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</ul>
						)}
					</Droppable>
				</div>
			</DragDropContext>

			{evaluation && (
				<Feedback isCorrect={evaluation.isCorrect}>
					<ul className="flex flex-col gap-2">
						{Object.entries(evaluation.feedback).map(([containerId, feedback]) => (
							<li key={containerId} className="flex flex-col">
								{feedback.isCorrect ? (
									<span className="font-semibold">{containerId}: OK</span>
								) : (
									<>
										<span className="font-semibold">{containerId}:</span>
										<span className="pl-4">
											{t("wrong_elements")} {feedback.missing.length}
										</span>
										<span className="pl-4">
											{t("wrong_elements")} {feedback.extra.length}
										</span>
									</>
								)}
							</li>
						))}
					</ul>
				</Feedback>
			)}
		</>
	);
}
