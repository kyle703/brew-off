import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { LoadedData } from "../types";
import { loadData } from "../data/fetch";

interface DataContextValue {
  data: LoadedData | null;
  loading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const hasLoadedOnceRef = useRef<boolean>(false);

  const refresh = useCallback(async (force: boolean = false) => {
    try {
      // Only show global loading spinner on the very first load
      if (!hasLoadedOnceRef.current) setLoading(true);
      const d = await loadData(force);
      console.log("loaded data", d);
      setData(d);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      // Ensure loading is cleared and mark that we've completed at least one load
      setLoading(false);
      hasLoadedOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    // initial load (force cache bypass to ensure fresh on boot)
    refresh(true);

    // poll every 60s
    timerRef.current = window.setInterval(() => {
      // Background refresh (no spinner due to hasLoadedOnceRef)
      refresh(true);
    }, 60 * 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, error, refresh }),
    [data, loading, error, refresh]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
} 