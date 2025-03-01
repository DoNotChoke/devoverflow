import React from "react";

import { getTags } from "@/lib/actions/tag.action";

const Tags = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "pytorch",
  });
  const { tags } = data || {};
  console.log(JSON.stringify(tags, null, 2));
  return <div>Page</div>;
};
export default Tags;
