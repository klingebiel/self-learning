import { t } from "./trpc";
import { adminRouter } from "./routers/admin.router";
import { authorRouter } from "./routers/author.router";
import { completionRouter } from "./routers/completion.router";
import { courseRouter } from "./routers/course.router";
import { enrollmentRouter } from "./routers/enrollment.router";
import { learningDiaryRouter } from "./routers/learning-diary.router";
import { lessonRouter } from "./routers/lesson.router";
import { meRouter } from "./routers/me.router";
import { programmingRouter } from "./routers/programming";
import { specializationRouter } from "./routers/specialization.router";
import { storageRouter } from "./routers/storage.router";
import { subjectRouter } from "./routers/subject.router";

export const appRouter = t.router({
	admin: adminRouter,
	author: authorRouter,
	completion: completionRouter,
	course: courseRouter,
	enrollment: enrollmentRouter,
	learningDiary: learningDiaryRouter,
	lesson: lessonRouter,
	me: meRouter,
	storage: storageRouter,
	specialization: specializationRouter,
	subject: subjectRouter,
	programming: programmingRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;