"use server";

import mongoose from "mongoose";

import Question from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag from "@/database/tag.model";
import action from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { AskQuestionSchema } from "@/lib/validation";
import { CreateQuestionParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";

export async function createQuestion(
  params: CreateQuestionParams,
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { title, content, tags } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      { session },
    );
    if (!question) {
      throw new Error("Failed to create question");
    }
    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocs = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session },
      );
      tagIds.push(existingTag._id);
      tagQuestionDocs.push({ tag: existingTag._id, question: question._id });
    }
    await TagQuestion.insertMany(tagQuestionDocs, { session });
    await Question.findByIdAndUpdate(
      question._id,
      {
        $push: { tags: { $each: tagIds } },
      },
      { session },
    );

    await session.commitTransaction();
    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
