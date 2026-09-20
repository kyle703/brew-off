import type { LoadedData } from "../types";

export async function loadData(_force: boolean = false): Promise<LoadedData> {
  const url = `${import.meta.env.BASE_URL}snapshot.json`;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load 2025 snapshot (${res.status})`);
  }
  return (await res.json()) as LoadedData;
}
