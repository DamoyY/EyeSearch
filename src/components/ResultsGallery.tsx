import type { ReactElement } from "react";

import { css } from "../../styled-system/css";
import { useColumnCount } from "../application/useColumnCount";
import { translate } from "../i18n/translate";
import type { ExaSearchViewResult } from "../exa/client";
import { faviconUrl, formatDisplayUrl } from "../lib/displayUrl";
import { Avatar } from "./ui/avatar";

interface ResultsGalleryProps {
  results: ExaSearchViewResult[];
}

interface PlacedResult {
  result: ExaSearchViewResult;
  shade: number;
}

function distributeColumns(
  results: ExaSearchViewResult[],
  columnCount: number,
): PlacedResult[][] {
  return Array.from({ length: columnCount }, (_, column) =>
    results.flatMap<PlacedResult>((result, index) =>
      index % columnCount === column
        ? [{ result, shade: (Math.floor(index / columnCount) + column) % 2 }]
        : [],
    ),
  );
}

export function ResultsGallery({ results }: ResultsGalleryProps): ReactElement {
  const columns = distributeColumns(results, useColumnCount());

  return (
    <section
      aria-label={translate("results.regionLabel")}
      className={viewportClass}
    >
      <div className={boardClass}>
        {columns.map((column, columnIndex) => (
          <ul className={columnClass} key={columnIndex}>
            {column.map(({ result, shade }) => (
              <ResultCard key={result.url} result={result} shade={shade} />
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

function ResultCard({ result, shade }: PlacedResult): ReactElement {
  const label = formatDisplayUrl(result.url);

  return (
    <li className={itemClass} data-shade={shade}>
      <Avatar
        className={iconClass}
        label={label}
        size="lg"
        src={faviconUrl(result.url)}
      />
      <a
        className={linkClass}
        href={result.url}
        rel="noreferrer"
        target="_blank"
      >
        {label}
      </a>
      <p className={summaryClass}>
        {result.summary.map((segment, index) => (
          <span className={segmentClass} key={index}>
            {segment}
          </span>
        ))}
      </p>
    </li>
  );
}

const viewportClass = css({
  minH: "calc(100vh - token(spacing.36))",
});

const boardClass = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "3",
});

const columnClass = css({
  display: "flex",
  flex: "1",
  minW: "0",
  flexDirection: "column",
  gap: "3",
  listStyle: "none",
  m: "0",
  p: "0",
});

const itemClass = css({
  borderRadius: "l2",
  bg: "gray.dark.2",
  p: "4",
  "&[data-shade='1']": {
    bg: "gray.dark.4",
  },
});

const iconClass = css({
  float: "left",
  shapeOutside: "circle(50%)",
  shapeMargin: "0.6rem",
  mr: "3",
  mb: "1",
});

const linkClass = css({
  color: "blue.11",
  overflowWrap: "anywhere",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
});

const summaryClass = css({
  m: "2 0 0",
  lineHeight: "relaxed",
});

const segmentClass = css({
  mr: "3",
  backgroundImage:
    "linear-gradient(to right, token(colors.white) 35%, token(colors.gray.dark.10))",
  backgroundClip: "text",
  color: "transparent",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
});
