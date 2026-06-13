import type { ReactElement } from "react";

import { css } from "../../styled-system/css";
import { translate } from "../i18n/translate";
import type { ExaSearchViewResult } from "../exa/client";
import { formatDisplayUrl } from "../lib/displayUrl";

interface ResultsGalleryProps {
  results: ExaSearchViewResult[];
}

export function ResultsGallery({ results }: ResultsGalleryProps): ReactElement {
  return (
    <section
      aria-label={translate("results.regionLabel")}
      className={viewportClass}
    >
      <ul className={listClass}>
        {results.map((result) => (
          <li className={itemClass} key={result.url}>
            <a
              className={linkClass}
              href={result.url}
              rel="noreferrer"
              target="_blank"
            >
              {formatDisplayUrl(result.url)}
            </a>
            <p className={summaryClass}>{result.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const viewportClass = css({
  minH: "calc(100vh - token(spacing.36))",
});

const listClass = css({
  display: "grid",
  gap: "3",
  listStyle: "none",
  m: "0",
  p: "0",
  "@media (orientation: landscape)": {
    columnCount: 2,
    columnGap: "4",
    columnRuleColor: "gray.7",
    columnRuleStyle: "solid",
    columnRuleWidth: "1px",
    display: "block",
  },
});

const itemClass = css({
  breakInside: "avoid",
  m: "0",
  p: "0",
  "@media (orientation: landscape)": {
    mb: "3",
  },
  "& + &": {
    borderTopWidth: "1px",
    borderColor: "gray.7",
    pt: "3",
  },
});

const linkClass = css({
  color: "blue.11",
  display: "inline-block",
  overflowWrap: "anywhere",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
});

const summaryClass = css({
  color: "white",
  lineHeight: "relaxed",
  m: "1 0 0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});
