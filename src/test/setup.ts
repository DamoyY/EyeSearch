import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

const consoleMethods = [
  "debug",
  "error",
  "groupCollapsed",
  "groupEnd",
  "info",
  "warn",
] as const;

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

beforeEach(() => {
  consoleMethods.forEach((method) => {
    vi.spyOn(console, method).mockImplementation(() => undefined);
  });
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
  document.head.innerHTML = '<meta name="description" content="Eye" />';
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});
