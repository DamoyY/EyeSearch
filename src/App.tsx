import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';

import { searchExa, type ExaSearchViewResult } from './lib/exa';
import { formatUnknown, logger } from './lib/logger';

const API_KEY_STORAGE_KEY = 'eye.exaApiKey';

function formatDisplayUrl(url: string): string {
  const parsedUrl = new URL(url);
  const host = parsedUrl.host.replace(/^www\./i, '');
  const pathname = parsedUrl.pathname.replace(/\/+$/, '');
  const displayPathname = pathname.endsWith('.html') ? pathname.slice(0, -5) : pathname;

  return `${host}${displayPathname}${parsedUrl.search}${parsedUrl.hash}`;
}

function dedupeResults(results: ExaSearchViewResult[], requestNumber: number): ExaSearchViewResult[] {
  const seen = new Map<string, number>();
  const dedupedResults: ExaSearchViewResult[] = [];

  results.forEach((result, index) => {
    const displayUrl = formatDisplayUrl(result.url);
    const firstIndex = seen.get(displayUrl);

    if (firstIndex !== undefined) {
      logger.warn('UI', `第 ${requestNumber} 次搜索的第 ${index + 1} 条结果与第 ${firstIndex + 1} 条重复，已丢弃`, {
        displayUrl,
        discardedUrl: result.url,
        keptUrl: dedupedResults[firstIndex]?.url,
      });
      return;
    }

    seen.set(displayUrl, dedupedResults.length);
    dedupedResults.push(result);
  });

  if (dedupedResults.length !== results.length) {
    logger.info('UI', `第 ${requestNumber} 次搜索已去重`, {
      originalCount: results.length,
      dedupedCount: dedupedResults.length,
      removedCount: results.length - dedupedResults.length,
    });
  }

  return dedupedResults;
}

function readInitialApiKey(): string {
  try {
    const storedApiKey = window.localStorage.getItem(API_KEY_STORAGE_KEY) ?? '';
    logger.info('Storage', '读取 API Key', {
      exists: storedApiKey.length > 0,
      length: storedApiKey.length,
    });
    return storedApiKey;
  } catch (error: unknown) {
    logger.error('Storage', '读取 API Key 失败', {
      error: formatUnknown(error),
    });
    throw error;
  }
}

function persistApiKey(apiKey: string): void {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    logger.debug('Storage', 'API Key 已写入存储', {
      length: apiKey.length,
    });
  } catch (error: unknown) {
    logger.error('Storage', '写入 API Key 失败', {
      error: formatUnknown(error),
    });
    throw error;
  }
}

export default function App(): ReactElement {
  const [apiKey, setApiKey] = useState(readInitialApiKey);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ExaSearchViewResult[]>([]);
  const requestCounterRef = useRef(0);

  useEffect(() => {
    logger.info('App', '组件挂载');

    const handleWindowError = (event: ErrorEvent): void => {
      logger.error('Global', 'window.error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: formatUnknown(event.error),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      logger.error('Global', 'unhandledrejection', {
        reason: formatUnknown(event.reason),
      });
    };

    logger.info('Global', '安装全局错误监听器');
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      logger.info('Global', '卸载全局错误监听器');
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  async function runSearch(): Promise<void> {
    const requestNumber = requestCounterRef.current + 1;
    requestCounterRef.current = requestNumber;

    const trimmedApiKey = apiKey.trim();
    const trimmedQuery = query.trim();

    logger.group('UI', `#${requestNumber} 搜索提交`);
    logger.info('UI', `输入校验 #${requestNumber}`, {
      hasApiKey: trimmedApiKey.length > 0,
      queryLength: trimmedQuery.length,
    });

    if (trimmedApiKey.length === 0) {
      logger.warn('UI', `第 ${requestNumber} 次提交缺少 API Key`);
      logger.groupEnd();
      return;
    }

    if (trimmedQuery.length === 0) {
      logger.warn('UI', `第 ${requestNumber} 次提交缺少搜索词`);
      logger.groupEnd();
      return;
    }

    setResults([]);

    try {
      const response = await searchExa({
        apiKey: trimmedApiKey,
        query: trimmedQuery,
        limit: 15,
        requestNumber,
      });

      const dedupedResults = dedupeResults(response.results, requestNumber);
      setResults(dedupedResults);
      logger.info('UI', `第 ${requestNumber} 次搜索完成`, {
        requestId: response.requestId,
        searchType: response.searchType,
        resultCount: dedupedResults.length,
        originalCount: response.results.length,
      });
      logger.debug('UI', `第 ${requestNumber} 次搜索结果`, dedupedResults);
    } catch (error: unknown) {
      logger.error('UI', `第 ${requestNumber} 次搜索失败`, {
        error: formatUnknown(error),
      });
    } finally {
      logger.groupEnd();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void runSearch();
  }

  return (
    <main className="app">
      <input
        aria-label="API Key"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        className="api-key-input"
        inputMode="text"
        onChange={(event) => {
          const nextApiKey = event.target.value;
          setApiKey(nextApiKey);
          persistApiKey(nextApiKey);
        }}
        onKeyDown={handleKeyDown}
        placeholder="API Key"
        spellCheck={false}
        type="text"
        value={apiKey}
      />

      <input
        aria-label="搜索"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        className="search-input"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="搜索"
        spellCheck={false}
        type="search"
        value={query}
      />

      <ul className="results">
        {results.map((result) => (
          <li key={result.url}>
            <a href={result.url} rel="noreferrer" target="_blank">
              {formatDisplayUrl(result.url)}
            </a>
            <p>{result.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
