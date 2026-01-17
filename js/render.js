// 渲染搜索结果
import { el } from "./dom.js";
function tryExtractAndFormatDate(snippetHtml) {
  let snippet = snippetHtml || "";
  const dateRegex = /^"?([A-Za-z]{3,}\s\d{1,2},\s\d{4})"?\s*/;
  const dateMatch = snippet.match(dateRegex);
  if (!dateMatch) return { formattedDate: "", restSnippet: snippet };
  const originalDateText = dateMatch[1];
  snippet = snippet.substring(dateMatch[0].length);
  const dateObj = new Date(originalDateText);
  if (Number.isNaN(dateObj.getTime())) {
    return { formattedDate: "", restSnippet: snippet };
  }
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return { formattedDate: `${y}-${m}-${d}`, restSnippet: snippet };
}
export function setResultsBusy(isBusy, searchingClass = "searching") {
  const resultsDiv = el.results();
  if (!resultsDiv) return;
  if (isBusy) {
    document.body.classList.add(searchingClass);
    resultsDiv.style.opacity = 0;
    resultsDiv.style.filter = "blur(3vmin)";
  } else {
    document.body.classList.remove(searchingClass);
    resultsDiv.style.opacity = 1;
    resultsDiv.style.filter = "blur(0)";
  }
}
export function renderResults(data, { append }) {
  const resultsDiv = el.results();
  if (!resultsDiv) return;
  if (!append) resultsDiv.innerHTML = "";
  if (!data?.items?.length) {
    if (!append) resultsDiv.textContent = "没有找到结果。";
    return;
  }
  data.items.forEach((item) => {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    const titleLink = document.createElement("a");
    titleLink.className = "result-title";
    titleLink.href = item.link;
    titleLink.textContent = item.title;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    const urlSpan = document.createElement("span");
    urlSpan.className = "link";
    urlSpan.textContent = item.formattedUrl || item.link;
    urlSpan.title = item.link;
    urlSpan.translate = false;
    const snippetDiv = document.createElement("div");
    snippetDiv.className = "result-snippet";
    const { formattedDate, restSnippet } = tryExtractAndFormatDate(
      item.htmlSnippet || "",
    );
    snippetDiv.innerHTML = restSnippet;
    resultItem.appendChild(titleLink);
    resultItem.appendChild(document.createElement("br"));
    resultItem.appendChild(urlSpan);
    if (formattedDate) {
      const dateSpan = document.createElement("span");
      dateSpan.className = "result-date";
      dateSpan.textContent = formattedDate;
      dateSpan.translate = false;
      resultItem.appendChild(dateSpan);
    }
    resultItem.appendChild(snippetDiv);
    resultsDiv.appendChild(resultItem);
  });
}
