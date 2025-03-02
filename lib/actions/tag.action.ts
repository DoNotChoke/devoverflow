import { FilterQuery } from "mongoose";

import { Question, Tag } from "@/database";
import action from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import {
  GetTagQuestionSchema,
  PaginatedSearchParamsSchema,
} from "@/lib/validation";
import { GetTagQuestionParams } from "@/types/action";
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Questions,
  Tags,
} from "@/types/global";

export async function getTags(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    tags: Tags[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  const filterQuery: FilterQuery<typeof Tag> = {};
  if (query) {
    filterQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  }
  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }
  try {
    const totalTags = await Tag.countDocuments(filterQuery);
    const tags = await Tag.find(filterQuery)
      .sort(sortCriteria)
      .limit(limit)
      .skip(skip);
    const isNext = totalTags > skip + tags.length;
    return {
      success: true,
      data: { tags: JSON.parse(JSON.stringify(tags)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTagQuestion(
  params: GetTagQuestionParams,
): Promise<
  ActionResponse<{ tag: Tags; questions: Questions[]; isNext: boolean }>
> {
  const validationResult = await action({
    params,
    schema: GetTagQuestionSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { tagId, page = 1, pageSize = 10, query } = params;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);
  try {
    const tag = await Tag.findById(tagId);
    if (!tag) throw new Error("Tag not found");
    const filterQuery: FilterQuery<typeof Question> = {
      tags: { $in: [tagId] },
    };
    if (query) {
      filterQuery.title = { $regex: query, $options: "i" };
    }
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .select("_id title views answers upvotes downvotes author createdAt")
      .populate([
        { path: "author", select: "name image" },
        { path: "tags", select: "name" },
      ])
      .skip(skip)
      .limit(limit);
    const isNext = totalQuestions > skip + questions.length;
    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
