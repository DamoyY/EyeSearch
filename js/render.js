// 渲染搜索结果
import { el } from "./dom.js";
function getFaviconUrl(link) {
  try {
    const url = new URL(link);
    if (!url.hostname) return "";
    return `https://www.google.com/s2/favicons?sz=64&domain=${url.hostname}`;
  } catch {
    return "";
  }
}
function stripScheme(url) {
  return String(url || "")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "");
}
function splitDisplayUrl(url) {
  const displayUrl = stripScheme(url);
  if (!displayUrl) return { displayUrl: "", main: "", minor: "" };
  const slashIndex = displayUrl.indexOf("/");
  if (slashIndex <= 0) {
    return { displayUrl, main: displayUrl, minor: "" };
  }
  return {
    displayUrl,
    main: displayUrl.slice(0, slashIndex),
    minor: displayUrl.slice(slashIndex),
  };
}
function getMinorScaleValue(element, fallback = 1) {
  if (!element || typeof getComputedStyle !== "function") return fallback;
  const raw = getComputedStyle(element)
    .getPropertyValue("--link-minor-scale")
    .trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}
function adjustMinorSpan(minorSpan) {
  if (!minorSpan) return;
  const scale = getMinorScaleValue(minorSpan);
  if (scale === 1) return;
  const width = minorSpan.offsetWidth;
  if (!width) return;
  const shrink = width * (1 - scale);
  minorSpan.style.marginRight = `${-shrink}px`;
}
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
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    const iconUrl = getFaviconUrl(item.link);
    if (iconUrl) {
      const iconWrap = document.createElement("span");
      iconWrap.className = "result-icon";
      const iconImg = document.createElement("img");
      iconImg.className = "result-icon-img";
      iconImg.src = iconUrl;
      iconImg.alt = "";
      iconImg.loading = "lazy";
      iconImg.decoding = "async";
      iconImg.referrerPolicy = "no-referrer";
      iconImg.addEventListener("load", () =>
        iconWrap.classList.add("is-loaded"),
      );
      iconImg.onerror = () => iconWrap.remove();
      iconWrap.appendChild(iconImg);
      titleLink.appendChild(iconWrap);
    }
    const titleText = document.createElement("span");
    titleText.textContent = item.title;
    titleLink.appendChild(titleText);
    const urlSpan = document.createElement("span");
    urlSpan.className = "link";
    const { displayUrl, main, minor } = splitDisplayUrl(
      item.formattedUrl || item.link,
    );
    urlSpan.title = displayUrl || item.link || "";
    urlSpan.textContent = "";
    let minorSpan = null;
    if (!main && !minor) {
      urlSpan.textContent = item.link || "";
    } else {
      const mainSpan = document.createElement("span");
      mainSpan.className = "link-main";
      mainSpan.textContent = main;
      urlSpan.appendChild(mainSpan);
      if (minor) {
        minorSpan = document.createElement("span");
        minorSpan.className = "link-minor";
        minorSpan.textContent = minor;
        urlSpan.appendChild(minorSpan);
      }
    }
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
    if (minorSpan) {
      adjustMinorSpan(minorSpan);
    }
  });
}
