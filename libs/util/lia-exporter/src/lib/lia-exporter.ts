import {
	toPlainText,
	markdownify,
	ExportFormat,
	liaScriptExport,
	IndentationLevels,
	LiaScriptSection
} from "./low-level-api";
import { FullCourseExport as CourseWithLessons } from "@self-learning/teaching";
import { LessonContent as LessonExport } from "@self-learning/lesson";
import { Quiz } from "@self-learning/quiz";

import { CourseChapter, LessonContent, findContentType } from "@self-learning/types";

export function exportCourse({ course, lessons }: CourseWithLessons, addTitlePage = true) {
	console.log(">Exporting course", course, lessons);
	const json: ExportFormat = {
		// The list of supported items are documented here:
		// https://liascript.github.io/course/?https://raw.githubusercontent.com/liaScript/docs/master/README.md#176
		meta: {
			title: course.title,
			author: course.authors.map(author => author.displayName).join(", "),
			date: new Date().toLocaleDateString(),
			version: "1.0",
			narrator: "Deutsch Female",
			...(course.description && { comment: toPlainText(course.description) }),
			...(course.imgUrl && { logo: course.imgUrl })
		},
		sections: []
	};

	if (addTitlePage) {
		console.log(">>Adding a title page");
		const section = {
			title: course.title,
			indent: 1 as IndentationLevels,
			body: [] as string[]
		};

		if (course.description) {
			console.log(">>>Adding a course description");
			const description = markdownify(course.description);
			section.body.push(description);
			if (course.imgUrl != null) {
				console.log(">>>>Adding an image");
				const courseImage = markdownify(course.imgUrl);
				section.body.push(courseImage);
			}
		}
		json.sections.push(section);
	}

	const lessonsMap = new Map<string, LessonExport>();
	for (const lesson of lessons) {
		console.log(">>Adding a lesson to map?", lesson.title);
		lessonsMap.set(lesson.lessonId, lesson);
	}
	for (const chapter of course.content as CourseChapter[]) {
		console.log(">>Adding a chapter", chapter.title); //Chapters are collections of lessons.
		const baseIndent = addTitlePage ? 2 : 1;

		addSection(chapter, lessonsMap, baseIndent, json.sections);
	}

	return liaScriptExport(json);
}

function addSection(
	chapter: CourseChapter,
	lessons: Map<string, LessonExport>,
	indent: IndentationLevels,
	sections: LiaScriptSection[]
) {
	console.log(">>>Adding a section", chapter.title);
	const section = {
		title: chapter.title,
		indent: indent,
		body: [] as (string | object)[]
	};

	if (chapter.description) {
		const description = markdownify(chapter.description);
		section.body.push(description);
	}

	sections.push(section);

	chapter.content.forEach(entry => {
		const lesson = lessons.get(entry.lessonId);
		if (lesson) {
			const lessonIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
			addLesson(lesson, lessonIndent, sections);
		}
	});
}

function addLesson(lesson: LessonExport, indent: IndentationLevels, sections: LiaScriptSection[]) {
	const nm = {
		title: lesson.title,
		indent: indent,
		body: [] as string[]
	};

	// Lesson's overview page, may contain:
	// - Sub title
	// - Picture
	// - Description
	// - Self-regulated question
	if (lesson.subtitle) {
		const subtitle = markdownify(lesson.subtitle);
		nm.body.push(subtitle);
	}
	if (lesson.description) {
		const description = markdownify(lesson.description);
		nm.body.push(description);
	}
	sections.push(nm);

	const lessonContent = lesson.content as LessonContent;

	const video = findContentType("video", lessonContent);
	if (video.content) {
		const videoIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const videoPart = {
			title: "Video",
			indent: videoIndent,
			body: [`!?[Video](${video.content.value.url})`]
		};

		sections.push(videoPart);
	}

	const article = findContentType("article", lessonContent);
	if (article.content) {
		const articleIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const articlePart = {
			title: "Artikel",
			indent: articleIndent,
			body: [markdownify(article.content.value.content, { htmlTag: "section" })]
		};

		sections.push(articlePart);
	}

	const pdf = findContentType("pdf", lessonContent);
	if (pdf.content) {
		const pdfIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const pdfPart = {
			title: "PDF",
			indent: pdfIndent,
			body: [pdf.content.value.url]
		};

		sections.push(pdfPart);
	}

	if (lesson.quiz) {
		console.log(">>>Creating a Quiz !!");
		const quizIndent = indent < 6 ? ((indent + 1) as IndentationLevels) : 6;
		const quizPart = {
			title: "Lernzielkontrolle",
			indent: quizIndent,
			body: [] as string[]
		};

		const quiz = lesson.quiz as Quiz;
		for (const question of quiz.questions) {
			console.log(question);
			switch (question.type) {
				case "multiple-choice": {
					let answers = "";
					for (const answer of question.answers) {
						if (answer.isCorrect) {
							answers += `- [[x]] ${markdownify(answer.content)}\n`;
						} else {
							answers += `- [[ ]] ${markdownify(answer.content)}\n`;
						}
					}
					const hints = addHints(question.hints);
					quizPart.body.push(markdownify(question.statement + "\n\n" + answers + hints));
					break;
				}
				case "exact": {
					const answers = `- [[${markdownify(question.acceptedAnswers[0].value)}]]\n`;
					const hints = addHints(question.hints);
					const answerScript = addTextQuizOptionScript(question.acceptedAnswers);
					quizPart.body.push(
						markdownify(question.statement + "\n\n" + answers + hints + answerScript)
					);
					break;
				}
				case "text": {
					// As we have no "correct" answer for this, we just use a text input which cannot be wrong.
					const answers = `- [[Freitext]]\n`;
					const hints = addHints(question.hints);
					const answerScript = `<script>\nlet input = "@input".trim()\ninput != ""</script>\n`;
					quizPart.body.push(
						markdownify(question.statement + "\n\n" + answers + hints + answerScript)
					);
					break;
				}
				case "cloze":
					{
						console.log("Cloze Question: ", question);
						let answer = question.clozeText;
						answer = addClozeQuiz(answer);
						quizPart.body.push(markdownify(question.statement + "\n\n" + answer));
					}
					break;
				case "programming":
					{
						console.log("PRogramming Question: ", question);
					}
					break;
				default:
					console.log(`Unknown question type: ${question.type}`);
					break;
			}
		}

		sections.push(quizPart);
	}
}
function addHints(hints: { hintId: string; content: string }[]) {
	let hintsList = "";
	for (const hint of hints) {
		console.log("Writing a Hint to Console: ", hint);
		hintsList += `[[?]] ${toPlainText(hint.content)}\n`;
	}
	console.log("Hints: ", hintsList);
	return hintsList;
}

function addTextQuizOptionScript(acceptedAnswers: { value: string; acceptedAnswerId: string }[]) {
	let script = `<script>\n`;
	script += `let input = "@input".trim()\n`;
	for (const [i, answer] of acceptedAnswers.entries()) {
		if (i == acceptedAnswers.length - 1) {
			script += `input == "${answer.value}"\n`;
		} else {
			script += `input == "${answer.value}" ||`;
		}
	}
	script += `</script>\n`;
	return script;
}

function addClozeQuiz(text: string) {
	//const text = "Das ist eine {T: [Textantwort]}. Das ist ein Textfeld {T: [Antwort, Lücke]} mit zwei richtigen Möglichkeiten.Das ist ein Single-Choice Feld mit {C: [#eins, zwei]} Antwortmöglichkeiten, aus denen ausgewählt werden muss. Falsche Antworten werden mit einem # gekennzeichnet.LaTeX kann verwendet werden, um mathematische Formeln und Symbole darzustellen. Zum Beispiel: $$V_{sphere} = \frac{4}{3}\pi r^3$$. Es kann auch in Single-Choice Feldern benutzt werden: {C: [#eins, $$V_{sphere} = \frac{4}{3}\pi r^3$$]}"
	let chars = [...text];
	let start = 0; //indicator/ counter for {
	let index = 0; //the index where the { is found
	let indexEnd = 0; //the index where the last closing } is found
	let found = 0; //confirmation that the first { is used to denote a answer in the cloze text
	let conf = 0; //as the second character can be a letter T or C make sure that the third is a ":" only then consider a answer block found
	let reducedToN = false; //used to indicate that a cloze answer is fully found and allows the conversion to start
	for (let i = 0; i < chars.length; i++) {
		//run through all letters of the text
		if (chars[i] == `}`) {
			//created to allow/ deal with } inside of normal text or answer blocks
			start--;
			if (start <= 0) {
				//no reason / use to have it below 0, but meant as a catch for } without the opening counterpart
				start = 0;
				if (conf == 1) {
					//Only start the reduction to 0 IF conf is 1 meaning a answer block is identified
					reducedToN = true;
				}
			}
		}
		//set found if the character matches one of the expected next ones only IF start is 1 otherwise reset index as well as start
		if (start == 1 && found == 0 && chars[i] != `T` && chars[i] != `C` && chars[i] != " ") {
			start = 0;
			index = 0;
		} else if (start == 1 && found == 0) {
			found++;
		}
		//Only if start and found are set, add conf if the next character matches the expected ones
		if (start == 1 && found == 1 && conf == 0 && chars[i] != `:`) {
			//make it insensitive to whitespaces in the start of the answer block
			if (chars[i] != `C` && chars[i] != `T` && chars[i] != " ") {
				start = 0;
				found = 0;
				index = 0;
			}
		} else if (start == 1 && found == 1 && conf == 0) {
			conf++;
		}
		//count the opening {}
		if (chars[i] == `{`) {
			start++;
			if (start == 1) {
				index = i;
			}
		}
		if (reducedToN) {
			indexEnd = i + 1;
			//transform a single answer block into the format needed for lia Script
			let newString = text.substring(index, indexEnd).replace(/(?<!\\)([\]|[])/g, ``); //remove the unneeded [ ]
			newString = newString.replace(`{`, `[[`); //Matches and substitutes the first { for the needed [[
			newString = newString.replace(/}(?=[^}]*$)/, `]]`); //Matches and replaced only the last } with ]]
			const cmatch = newString.match(/C:/); // prepare for selection type word
			newString = newString.replace(/[T|C]:/g, ``); // removes the unneeded T and C starters
			//Deal with the selection sub case by adding () all answers marked by #
			if (cmatch != null) {
				const word = newString.match(
					/(?<=\[\[\s#|,#|\[\[#|,\s#)\s*(.*?)\s*(?=,|\]\]|\s,|\s\]\])/g
				);
				if (word != null) {
					for (const match of word) {
						const strWord = match; //only get the matched word!
						const start = newString.indexOf(strWord);
						const end = start + strWord.length;
						newString =
							newString.slice(0, start) +
							`(` +
							newString.slice(start, end) +
							`)` +
							newString.slice(end);
						newString = newString.replace(
							/(?<=\[\[\s|,|\[\[|,\s)\s*#(?=.*,|.*\]\]|.*\s,|.*\s\]\])/,
							``
						); //get rid of the # of the current answer
					}
				}
			}
			newString = newString.replace(/,/g, `|`); // replace all , with |
			reducedToN = false;
			text = text.slice(0, index) + newString + text.slice(indexEnd); //replace the old answer block with the new one
			indexEnd = 0;
			found = 0;
			conf = 0;
			chars = [...text]; // re split the text as the index of everything might have changed
		}
	}
	return text;
}
