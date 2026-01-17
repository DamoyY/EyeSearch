// 搜索相关状态
export const state = {
  query: "",
  startIndex: 1,
  isLoading: false,
  hasMore: true,
  lastRequestId: 0,
};
export function resetSearchState(query) {
  state.query = (query ?? "").trim();
  state.startIndex = 1;
  state.isLoading = false;
  state.hasMore = true;
}
export function updatePaginationFromResponse(data) {
  if (data?.items?.length) {
    state.startIndex += data.items.length;
  }
  state.hasMore = Boolean(data?.queries?.nextPage);
}
