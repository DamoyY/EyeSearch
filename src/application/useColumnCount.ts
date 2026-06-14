import { useSyncExternalStore } from "react";

const LANDSCAPE_QUERY = "(orientation: landscape)";

function subscribe(callback: () => void): () => void {
  const media = window.matchMedia(LANDSCAPE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useColumnCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(LANDSCAPE_QUERY).matches ? 2 : 1),
    () => 1,
  );
}
