export const paginateData_cursor = (
  cursor: string,
  // noCursorOffset: number,
  limit: number,
  data: any[]
) => {
  let newCursor: string = "";
  let newIdx = 0;
  let offset = 0;
  if (!cursor) {
    newCursor = data[limit]._id.toString();
    newIdx = data.findIndex((x) => x._id.toString() === newCursor);

  } else {
    offset = data.findIndex((x) => x._id.toString() === cursor);
    newIdx = offset + limit;

    if (!data[newIdx]) {
      newCursor = "";
      newIdx = data.length;
    } else {
      newCursor = data[newIdx]._id.toString();
    }
  }

  const finalData = data.slice(offset, newIdx);

  return {
    cursor: newCursor,
    data: data.slice(offset, newIdx),
    hasMoreData: finalData.length === limit,
  };
};
