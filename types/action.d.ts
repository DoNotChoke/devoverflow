import { PaginatedSearchParams } from "@/types/global";

export interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string;
    email: string;
    image: string;
    username: string;
  };
}

export interface AuthCredentials {
  name: string;
  username: string;
  password: string;
  email: string;
}

export interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

export interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

export interface GetQuestionParams {
  questionId: string;
}

export interface GetTagQuestionParams
  extends Omit<PaginatedSearchParams, "fiter"> {
  tagId: string;
}

export interface IncrementViewsParams {
  questionId: string;
}

export interface CreateAnswerParams {
  questionId: string;
  content: string;
}

export interface GetAnswerParams extends PaginatedSearchParams {
  questionId: string;
}
