import { createContext, useContext } from "react";

/** Captured source CommandLine state; undefined keeps explicit DEV URL callers working. */
export const LaunchModeContext = createContext<string | null | undefined>(undefined);
export function useLaunchMode(): string | undefined {
  const captured = useContext(LaunchModeContext);
  return captured === undefined ? new URLSearchParams(window.location.search).get("modulo") ?? undefined : captured ?? undefined;
}
