function removeLeadingWww(host: string): string {
  return host.replace(/^www\./i, "");
}

function trimTrailingSlashes(pathname: string): string {
  return pathname.replace(/\/+$/, "");
}

function stripHtmlExtension(pathname: string): string {
  return pathname.replace(/\.html$/i, "");
}

export function formatDisplayUrl(url: string): string {
  const parsedUrl = new URL(url);
  const host = removeLeadingWww(parsedUrl.host);
  const pathname = trimTrailingSlashes(parsedUrl.pathname);
  const displayPathname = stripHtmlExtension(pathname);

  return `${host}${displayPathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function createResultKey(url: string): string {
  return formatDisplayUrl(url).toLocaleLowerCase("en-US");
}

const FAVICON_ENDPOINT = "https://www.google.com/s2/favicons";

export function faviconUrl(url: string): string {
  return `${FAVICON_ENDPOINT}?sz=64&domain=${new URL(url).hostname}`;
}
