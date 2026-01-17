import { ANIMATION_MS, SEARCHING_CLASS, exampleData } from "./config.js";
import { el, getQueryText, setQueryText } from "./dom.js";
import { sleep } from "./utils.js";
import { readQueryFromUrl, writeQueryToUrl } from "./url-sync.js";
import {
  state,
  resetSearchState,
  updatePaginationFromResponse,
} from "./state.js";
import { fetchSearch } from "./api.js";
import { renderResults, setResultsBusy } from "./render.js";
async function runSearch({ query, fromPopState = false }) {
  const normalized = (query ?? "").trim();
  resetSearchState(normalized);
  if (!fromPopState) writeQueryToUrl(normalized);
  setResultsBusy(true, SEARCHING_CLASS);
  await sleep(ANIMATION_MS);
  window.scrollTo(0, 0);
  if (!normalized) {
    setResultsBusy(false, SEARCHING_CLASS);
    renderResults(exampleData, { append: false });
    return;
  }
  const requestId = ++state.lastRequestId;
  try {
    const { data, requestId: returnedId } = await fetchSearch(
      normalized,
      state.startIndex,
      requestId,
    );
    // 只渲染最新请求，避免慢请求覆盖快请求
    if (returnedId !== state.lastRequestId) return;
    setResultsBusy(false, SEARCHING_CLASS);
    renderResults(data, { append: false });
    updatePaginationFromResponse(data);
  } catch {
    // 仅在该请求仍是最新时展示错误
    if (requestId !== state.lastRequestId) return;
    setResultsBusy(false, SEARCHING_CLASS);
    const resultsDiv = el.results();
    if (resultsDiv) resultsDiv.textContent = "搜索失败，请稍后重试。";
  }
}
async function loadMore() {
  if (state.isLoading || !state.hasMore || !state.query) return;
  state.isLoading = true;
  const requestId = ++state.lastRequestId;
  try {
    const { data, requestId: returnedId } = await fetchSearch(
      state.query,
      state.startIndex,
      requestId,
    );
    if (returnedId !== state.lastRequestId) return;
    renderResults(data, { append: true });
    updatePaginationFromResponse(data);
  } catch {
    // 忽略加载更多失败，避免打断阅读
  } finally {
    state.isLoading = false;
  }
}
function handleUrlChange() {
  const q = readQueryFromUrl();
  setQueryText(q);
  runSearch({ query: q, fromPopState: true });
}
function wireEvents() {
  window.search = () => runSearch({ query: getQueryText() });
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    if (scrollHeight - scrollTop - clientHeight < 10) loadMore();
  });
  window.addEventListener("popstate", handleUrlChange);
  // contenteditable 粘贴改为纯文本
  el.query()?.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData(
      "text/plain",
    );
    document.execCommand("insertText", false, text);
  });
}
export function boot() {
  wireEvents();
  handleUrlChange();
}
