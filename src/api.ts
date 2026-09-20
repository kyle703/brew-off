import type { AdminStats, Bootstrap, Competition, Entry, LoadedData } from "./types";

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function getBootstrap(): Promise<Bootstrap> {
  const res = await fetch("/api/bootstrap", { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
}

export async function patchCompetition(
  patch: Partial<{
    name: string;
    tagline: string | null;
    themeId: string;
    status: Competition["status"];
    registrationOpen: boolean;
    tastingOpen: boolean;
    entriesFrozen: boolean;
  }>,
): Promise<Competition> {
  const res = await fetch("/api/admin/competition", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { competition: Competition };
  return data.competition;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/stats", { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function createEntry(form: FormData): Promise<Entry> {
  const res = await fetch("/api/entries", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { entry: Entry };
  return data.entry;
}

export async function patchEntry(id: string, form: FormData): Promise<Entry> {
  const res = await fetch(`/api/admin/entries/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as { entry: Entry };
  return data.entry;
}

export async function ensureVoter(nickname?: string) {
  const res = await fetch("/api/voters", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname: nickname || undefined }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ voter: { id: string; nickname: string | null } }>;
}

export async function saveBallot(
  code: string,
  scores: Record<string, number>,
  comment: string,
) {
  const res = await fetch(`/api/ballots/${code}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scores, comment }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getReveal(): Promise<LoadedData> {
  const res = await fetch("/api/reveal", { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getResults(): Promise<LoadedData> {
  const res = await fetch("/api/results", { credentials: "include" });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
