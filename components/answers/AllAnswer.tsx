import React from "react";

import AnswerCard from "@/components/cards/AnswerCard";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_ANSWERS } from "@/constants/states";
import { ActionResponse, Answers } from "@/types/global";

interface Props extends ActionResponse<Answers[]> {
  totalAnswers: number;
}
const AllAnswer = ({ data, success, error, totalAnswers }: Props) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>
        <p>Filter</p>
      </div>
      <DataRenderer
        success={success}
        data={data}
        empty={EMPTY_ANSWERS}
        error={error}
        render={(answers) =>
          answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)
        }
      />
    </div>
  );
};
export default AllAnswer;
