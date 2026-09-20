import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getBootstrap } from "../api";
import type { Bootstrap } from "../types";

type SessionValue = {
  bootstrap: Bootstrap | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);
const POLL_MS = 4000;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getBootstrap();
      setBootstrap(data);
      setError(null);
      document.documentElement.dataset.theme = data.competition.themeId;
      document.title = data.competition.name;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    const kick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("focus", kick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("focus", kick);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ bootstrap, loading, error, refresh }),
    [bootstrap, loading, error, refresh],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/* eslint-disable react-refresh/only-export-components */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
