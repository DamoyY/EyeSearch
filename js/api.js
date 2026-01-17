// 网络请求

import { GOOGLE_API_KEY, GOOGLE_CX } from "./config.js";

function buildFetchUrl(query, startIndex) {
    return `https://customsearch.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
        query
    )}&start=${startIndex}`;
}

export async function fetchSearch(query, startIndex, requestId) {
    const url = buildFetchUrl(query, startIndex);

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, requestId };
}
