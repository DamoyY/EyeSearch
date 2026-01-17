// DOM 读取/写入

export const el = {
    query: () => document.getElementById("query"),
    results: () => document.getElementById("results"),
};

export function getQueryText() {
    return (el.query()?.innerText ?? "").trim();
}

export function setQueryText(value) {
    const q = el.query();
    if (q) q.innerText = value ?? "";
}
