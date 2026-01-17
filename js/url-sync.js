// URL 与查询参数同步

export function writeQueryToUrl(query) {
    const q = (query ?? "").trim();
    const url = new URL(window.location.href);

    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");

    if (url.href !== window.location.href) {
        window.history.pushState({ query: q }, "", url);
    }
}

export function readQueryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return (urlParams.get("q") ?? "").trim();
}
