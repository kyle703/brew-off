import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { computeSnapshot } from "./snapshot";
import { signValue, verifyValue } from "./sign";
import type {
  BallotRow,
  CompetitionRow,
  EntryRow,
  Env,
  ScoringCriterion,
  VoterRow,
} from "./types";

type Vars = {
  isAdmin: boolean;
  voterId: string | null;
};

const app = new Hono<{ Bindings: Env; Variables: Vars }>();

const ADMIN_COOKIE = "brew_admin";
const VOTER_COOKIE = "brew_voter";
const STATUSES = [
  "draft",
  "registration",
  "tasting",
  "closed",
  "reveal",
  "published",
] as const;

function cookieOpts(url: string, maxAge: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "Lax" as const,
    secure: url.startsWith("https://"),
    maxAge,
  };
}

function labelUrl(key: string | null): string | null {
  return key ? `/api/labels/${key}` : null;
}

function parseSchema(raw: string): ScoringCriterion[] {
  try {
    const parsed = JSON.parse(raw) as ScoringCriterion[];
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* ignore */
  }
  return [
    { id: "drinkability", label: "Drinkability" },
    { id: "flavor", label: "Flavor" },
    { id: "color", label: "Color" },
    { id: "label", label: "Label" },
    { id: "overall", label: "Overall" },
  ];
}

const DEFAULT_TASTING_DISPLAY = {
  brewer: false,
  beerName: true,
  style: true,
  abv: true,
};

type TastingDisplay = typeof DEFAULT_TASTING_DISPLAY;

function parseTastingDisplay(raw: string | null | undefined): TastingDisplay {
  try {
    const parsed = JSON.parse(raw || "") as { tasting?: Partial<TastingDisplay> };
    const tasting = parsed.tasting ?? {};
    return {
      brewer: tasting.brewer === true,
      beerName: tasting.beerName !== false,
      style: tasting.style !== false,
      abv: tasting.abv !== false,
    };
  } catch {
    return { ...DEFAULT_TASTING_DISPLAY };
  }
}

function guestMayRegister(row: CompetitionRow): boolean {
  if (row.registration_open !== 1 || row.entries_frozen === 1) return false;
  return row.status === "registration" || row.status === "tasting";
}

function tastingLive(row: CompetitionRow): boolean {
  return row.tasting_open === 1 || row.status === "tasting";
}

function publicCompetition(row: CompetitionRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    year: row.year,
    status: row.status,
    themeId: row.theme_id,
    scoringSchema: parseSchema(row.scoring_schema),
    registrationOpen: row.registration_open === 1,
    tastingOpen: row.tasting_open === 1,
    entriesFrozen: row.entries_frozen === 1,
    tastingDisplay: parseTastingDisplay(row.display_settings),
  };
}

function publicEntry(
  row: EntryRow,
  opts: { isAdmin?: boolean; tasting?: boolean; display?: TastingDisplay } = {},
) {
  const full = {
    id: row.id,
    entryCode: row.entry_code,
    beerName: row.beer_name,
    brewer: row.brewer,
    style: row.style,
    abv: row.abv,
    description: row.description,
    labelUrl: labelUrl(row.label_key),
    status: row.status as "active" | "hidden",
  };
  if (opts.isAdmin || !opts.tasting) return full;
  const display = opts.display ?? DEFAULT_TASTING_DISPLAY;
  return {
    ...full,
    beerName: display.beerName ? row.beer_name : "",
    brewer: display.brewer ? row.brewer : "",
    style: display.style ? row.style : null,
    abv: display.abv ? row.abv : null,
    description: null,
  };
}

async function currentCompetition(db: D1Database): Promise<CompetitionRow | null> {
  return db
    .prepare("SELECT * FROM competitions ORDER BY year DESC LIMIT 1")
    .first<CompetitionRow>();
}

async function requireCompetition(c: { env: Env }) {
  const row = await currentCompetition(c.env.DB);
  if (!row) return null;
  return row;
}

app.use("/api/*", async (c, next) => {
  const adminTok = getCookie(c, ADMIN_COOKIE);
  const voterTok = getCookie(c, VOTER_COOKIE);
  const adminPayload = await verifyValue(c.env.COOKIE_SECRET, adminTok);
  const voterPayload = await verifyValue(c.env.COOKIE_SECRET, voterTok);
  c.set("isAdmin", adminPayload === "admin");
  c.set("voterId", voterPayload);
  await next();
});

app.get("/api/health", (c) => c.json({ ok: true }));

app.get("/api/bootstrap", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);

  const isAdmin = c.get("isAdmin");
  const entrySql = isAdmin
    ? "SELECT * FROM entries WHERE competition_id = ? ORDER BY CAST(entry_code AS INTEGER)"
    : "SELECT * FROM entries WHERE competition_id = ? AND status = 'active' ORDER BY CAST(entry_code AS INTEGER)";
  const { results: entries } = await c.env.DB.prepare(entrySql)
    .bind(competition.id)
    .all<EntryRow>();

  let voter = null;
  let ballots: Array<{
    entryId: string;
    entryCode: string;
    scores: Record<string, number>;
    comment: string | null;
    updatedAt: string;
  }> = [];

  const voterId = c.get("voterId");
  if (voterId) {
    const v = await c.env.DB.prepare(
      "SELECT * FROM voters WHERE id = ? AND competition_id = ?",
    )
      .bind(voterId, competition.id)
      .first<VoterRow>();
    if (v) {
      voter = { id: v.id, nickname: v.nickname };
      const { results } = await c.env.DB.prepare(
        `SELECT b.*, e.entry_code FROM ballots b
         JOIN entries e ON e.id = b.entry_id
         WHERE b.voter_id = ?`,
      )
        .bind(v.id)
        .all<BallotRow & { entry_code: string }>();
      ballots = results.map((row) => ({
        entryId: row.entry_id,
        entryCode: row.entry_code,
        scores: JSON.parse(row.scores) as Record<string, number>,
        comment: row.comment,
        updatedAt: row.updated_at,
      }));
    }
  }

  return c.json({
    competition: publicCompetition(competition),
    entries: entries.map((entry) =>
      publicEntry(entry, {
        isAdmin,
        tasting: tastingLive(competition),
        display: parseTastingDisplay(competition.display_settings),
      }),
    ),
    voter,
    ballots,
    isAdmin,
  });
});

app.post("/api/admin/login", async (c) => {
  const body = await c.req.json<{ password?: string }>().catch(() => ({}));
  if (!body.password || body.password !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: "Wrong password" }, 401);
  }
  const token = await signValue(c.env.COOKIE_SECRET, "admin");
  setCookie(c, ADMIN_COOKIE, token, cookieOpts(c.req.url, 60 * 60 * 24 * 7));
  return c.json({ ok: true });
});

app.post("/api/admin/logout", (c) => {
  deleteCookie(c, ADMIN_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

app.get("/api/admin/me", (c) => {
  if (!c.get("isAdmin")) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ ok: true });
});

app.get("/api/admin/stats", async (c) => {
  if (!c.get("isAdmin")) return c.json({ error: "Unauthorized" }, 401);
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);

  const tasters = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM voters WHERE competition_id = ?",
  )
    .bind(competition.id)
    .first<{ n: number }>();
  const ballots = await c.env.DB.prepare(
    `SELECT COUNT(*) AS n FROM ballots b
     JOIN entries e ON e.id = b.entry_id
     WHERE e.competition_id = ?`,
  )
    .bind(competition.id)
    .first<{ n: number }>();
  const { results: entryCounts } = await c.env.DB.prepare(
    `SELECT e.id, e.entry_code, e.beer_name, COUNT(b.voter_id) AS ballot_count
     FROM entries e
     LEFT JOIN ballots b ON b.entry_id = e.id
     WHERE e.competition_id = ?
     GROUP BY e.id
     ORDER BY CAST(e.entry_code AS INTEGER)`,
  )
    .bind(competition.id)
    .all<{ id: string; entry_code: string; beer_name: string; ballot_count: number }>();

  return c.json({
    tasters: tasters?.n ?? 0,
    ballots: ballots?.n ?? 0,
    entries: entryCounts.map((e) => ({
      id: e.id,
      entryCode: e.entry_code,
      beerName: e.beer_name,
      ballotCount: e.ballot_count,
    })),
  });
});

app.patch("/api/admin/competition", async (c) => {
  if (!c.get("isAdmin")) return c.json({ error: "Unauthorized" }, 401);
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  const body = await c.req.json<{
    name?: string;
    tagline?: string | null;
    themeId?: string;
    status?: string;
    registrationOpen?: boolean;
    tastingOpen?: boolean;
    entriesFrozen?: boolean;
    tastingDisplay?: Partial<TastingDisplay>;
  }>();

  let status = competition.status;
  let registrationOpen = competition.registration_open;
  let tastingOpen = competition.tasting_open;
  let entriesFrozen = competition.entries_frozen;
  let snapshot = competition.snapshot;
  let tastingDisplay = parseTastingDisplay(competition.display_settings);

  if (body.status) {
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      return c.json({ error: "Invalid status" }, 400);
    }
    status = body.status;
    if (status === "registration") {
      registrationOpen = 1;
    }
    if (status === "tasting") {
      tastingOpen = 1;
    }
    if (status === "closed" || status === "reveal" || status === "published") {
      tastingOpen = 0;
      registrationOpen = 0;
      snapshot = JSON.stringify(await freeze(c.env, competition));
    }
    if (status === "draft") {
      tastingOpen = 0;
      registrationOpen = 0;
    }
  }
  if (typeof body.registrationOpen === "boolean") {
    registrationOpen = body.registrationOpen ? 1 : 0;
  }
  if (typeof body.tastingOpen === "boolean") {
    tastingOpen = body.tastingOpen ? 1 : 0;
  }
  if (typeof body.entriesFrozen === "boolean") {
    entriesFrozen = body.entriesFrozen ? 1 : 0;
  }
  if (body.tastingDisplay) {
    tastingDisplay = {
      brewer:
        typeof body.tastingDisplay.brewer === "boolean"
          ? body.tastingDisplay.brewer
          : tastingDisplay.brewer,
      beerName:
        typeof body.tastingDisplay.beerName === "boolean"
          ? body.tastingDisplay.beerName
          : tastingDisplay.beerName,
      style:
        typeof body.tastingDisplay.style === "boolean"
          ? body.tastingDisplay.style
          : tastingDisplay.style,
      abv:
        typeof body.tastingDisplay.abv === "boolean"
          ? body.tastingDisplay.abv
          : tastingDisplay.abv,
    };
  }

  const name = body.name?.trim() || competition.name;
  const tagline =
    body.tagline === undefined ? competition.tagline : body.tagline;
  const themeId = body.themeId?.trim() || competition.theme_id;

  await c.env.DB.prepare(
    `UPDATE competitions SET
      name = ?, tagline = ?, theme_id = ?, status = ?,
      registration_open = ?, tasting_open = ?, entries_frozen = ?,
      display_settings = ?, snapshot = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      name,
      tagline,
      themeId,
      status,
      registrationOpen,
      tastingOpen,
      entriesFrozen,
      JSON.stringify({ tasting: tastingDisplay }),
      snapshot,
      competition.id,
    )
    .run();

  const updated = await requireCompetition(c);
  return c.json({ competition: publicCompetition(updated!) });
});

async function freeze(env: Env, competition: CompetitionRow) {
  const { results: entries } = await env.DB.prepare(
    "SELECT * FROM entries WHERE competition_id = ?",
  )
    .bind(competition.id)
    .all<EntryRow>();
  const { results: voters } = await env.DB.prepare(
    "SELECT * FROM voters WHERE competition_id = ?",
  )
    .bind(competition.id)
    .all<VoterRow>();
  const { results: ballots } = await env.DB.prepare(
    `SELECT b.* FROM ballots b
     JOIN entries e ON e.id = b.entry_id
     WHERE e.competition_id = ?`,
  )
    .bind(competition.id)
    .all<BallotRow>();
  return computeSnapshot(
    entries,
    ballots,
    voters,
    parseSchema(competition.scoring_schema),
    labelUrl,
  );
}

async function nextEntryCode(db: D1Database, competitionId: string) {
  const row = await db
    .prepare(
      "SELECT entry_code FROM entries WHERE competition_id = ? ORDER BY CAST(entry_code AS INTEGER) DESC LIMIT 1",
    )
    .bind(competitionId)
    .first<{ entry_code: string }>();
  const n = row ? Number.parseInt(row.entry_code, 10) + 1 : 1;
  return String(n).padStart(2, "0");
}

async function storeLabel(env: Env, file: File) {
  const buf = await file.arrayBuffer();
  if (buf.byteLength > 2_500_000) throw new Error("Image too large");
  const key = `${crypto.randomUUID()}`;
  const type = file.type || "image/jpeg";
  await env.LABELS.put(key, buf, { httpMetadata: { contentType: type } });
  return key;
}

app.post("/api/entries", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  const isAdmin = c.get("isAdmin");
  if (!isAdmin && !guestMayRegister(competition)) {
    return c.json({ error: "Registration is closed" }, 403);
  }

  const contentType = c.req.header("content-type") || "";
  let brewer = "";
  let beerName = "";
  let style: string | null = null;
  let abv: number | null = null;
  let description: string | null = null;
  let file: File | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await c.req.formData();
    brewer = String(form.get("brewer") || "").trim();
    beerName = String(form.get("beerName") || "").trim();
    style = String(form.get("style") || "").trim() || null;
    const abvRaw = String(form.get("abv") || "").trim();
    abv = abvRaw ? Number(abvRaw) : null;
    description = String(form.get("description") || "").trim() || null;
    const f = form.get("label");
    if (f instanceof File && f.size > 0) file = f;
  } else {
    const body = await c.req.json<{
      brewer?: string;
      beerName?: string;
      style?: string;
      abv?: number | null;
      description?: string;
    }>();
    brewer = (body.brewer || "").trim();
    beerName = (body.beerName || "").trim();
    style = body.style?.trim() || null;
    abv = body.abv ?? null;
    description = body.description?.trim() || null;
  }

  if (!brewer || !beerName) {
    return c.json({ error: "Brewer and beer name are required" }, 400);
  }
  if (abv != null && !Number.isFinite(abv)) {
    return c.json({ error: "Invalid ABV" }, 400);
  }

  let labelKey: string | null = null;
  if (file) {
    try {
      labelKey = await storeLabel(c.env, file);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  }

  const id = crypto.randomUUID();
  const entryCode = await nextEntryCode(c.env.DB, competition.id);
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    `INSERT INTO entries (
      id, competition_id, entry_code, beer_name, brewer, style, abv,
      description, label_key, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
  )
    .bind(
      id,
      competition.id,
      entryCode,
      beerName,
      brewer,
      style,
      abv,
      description,
      labelKey,
      now,
      now,
    )
    .run();

  const created = await c.env.DB.prepare("SELECT * FROM entries WHERE id = ?")
    .bind(id)
    .first<EntryRow>();
  return c.json({ entry: publicEntry(created!) }, 201);
});

app.patch("/api/admin/entries/:id", async (c) => {
  if (!c.get("isAdmin")) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare("SELECT * FROM entries WHERE id = ?")
    .bind(id)
    .first<EntryRow>();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const contentType = c.req.header("content-type") || "";
  let patch: Record<string, unknown> = {};
  let file: File | null = null;
  if (contentType.includes("multipart/form-data")) {
    const form = await c.req.formData();
    for (const key of ["beerName", "brewer", "style", "abv", "description", "status"] as const) {
      const v = form.get(key);
      if (v != null && String(v) !== "") patch[key] = String(v);
    }
    const f = form.get("label");
    if (f instanceof File && f.size > 0) file = f;
  } else {
    patch = await c.req.json();
  }

  let labelKey = existing.label_key;
  if (file) {
    try {
      labelKey = await storeLabel(c.env, file);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  }

  const beerName = String(patch.beerName ?? existing.beer_name);
  const brewer = String(patch.brewer ?? existing.brewer);
  const style =
    patch.style === undefined ? existing.style : String(patch.style || "") || null;
  const abv =
    patch.abv === undefined || patch.abv === ""
      ? existing.abv
      : Number(patch.abv);
  const description =
    patch.description === undefined
      ? existing.description
      : String(patch.description || "") || null;
  const status = String(patch.status ?? existing.status);
  if (status !== "active" && status !== "hidden") {
    return c.json({ error: "Invalid status" }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE entries SET beer_name = ?, brewer = ?, style = ?, abv = ?,
      description = ?, label_key = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(beerName, brewer, style, abv, description, labelKey, status, id)
    .run();

  const updated = await c.env.DB.prepare("SELECT * FROM entries WHERE id = ?")
    .bind(id)
    .first<EntryRow>();
  return c.json({ entry: publicEntry(updated!) });
});

app.get("/api/labels/:key", async (c) => {
  const key = c.req.param("key");
  const obj = await c.env.LABELS.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  const headers = new Headers();
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  const type = obj.httpMetadata?.contentType || "image/jpeg";
  headers.set("Content-Type", type);
  return new Response(obj.body, { headers });
});

app.post("/api/voters", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  const body = await c.req.json<{ nickname?: string }>().catch(() => ({}));
  const nickname = body.nickname?.trim() || null;

  let voterId = c.get("voterId");
  if (voterId) {
    const existing = await c.env.DB.prepare(
      "SELECT * FROM voters WHERE id = ? AND competition_id = ?",
    )
      .bind(voterId, competition.id)
      .first<VoterRow>();
    if (existing) {
      if (nickname && nickname !== existing.nickname) {
        await c.env.DB.prepare(
          "UPDATE voters SET nickname = ? WHERE id = ?",
        )
          .bind(nickname, existing.id)
          .run();
      }
      const token = await signValue(c.env.COOKIE_SECRET, existing.id);
      setCookie(c, VOTER_COOKIE, token, cookieOpts(c.req.url, 60 * 60 * 24 * 30));
      return c.json({
        voter: { id: existing.id, nickname: nickname || existing.nickname },
      });
    }
  }

  voterId = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO voters (id, competition_id, nickname, created_at) VALUES (?, ?, ?, datetime('now'))",
  )
    .bind(voterId, competition.id, nickname)
    .run();
  const token = await signValue(c.env.COOKIE_SECRET, voterId);
  setCookie(c, VOTER_COOKIE, token, cookieOpts(c.req.url, 60 * 60 * 24 * 30));
  return c.json({ voter: { id: voterId, nickname } }, 201);
});

app.put("/api/ballots/:code", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  if (competition.tasting_open !== 1) {
    return c.json({ error: "Voting is closed" }, 403);
  }
  let voterId = c.get("voterId");
  if (!voterId) {
    voterId = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO voters (id, competition_id, nickname, created_at) VALUES (?, ?, NULL, datetime('now'))",
    )
      .bind(voterId, competition.id)
      .run();
    const token = await signValue(c.env.COOKIE_SECRET, voterId);
    setCookie(c, VOTER_COOKIE, token, cookieOpts(c.req.url, 60 * 60 * 24 * 30));
  } else {
    const v = await c.env.DB.prepare(
      "SELECT id FROM voters WHERE id = ? AND competition_id = ?",
    )
      .bind(voterId, competition.id)
      .first();
    if (!v) {
      await c.env.DB.prepare(
        "INSERT INTO voters (id, competition_id, nickname, created_at) VALUES (?, ?, NULL, datetime('now'))",
      )
        .bind(voterId, competition.id)
        .run();
    }
  }

  const code = c.req.param("code");
  const entry = await c.env.DB.prepare(
    "SELECT * FROM entries WHERE competition_id = ? AND entry_code = ? AND status = 'active'",
  )
    .bind(competition.id, code)
    .first<EntryRow>();
  if (!entry) return c.json({ error: "Unknown bottle" }, 404);

  const body = await c.req.json<{
    scores?: Record<string, number>;
    comment?: string | null;
  }>();
  const schema = parseSchema(competition.scoring_schema);
  const scores: Record<string, number> = {};
  for (const criterion of schema) {
    const n = Number(body.scores?.[criterion.id]);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return c.json({ error: `Score 1–5 required for ${criterion.label}` }, 400);
    }
    scores[criterion.id] = n;
  }

  const comment = body.comment?.trim() || null;
  await c.env.DB.prepare(
    `INSERT INTO ballots (voter_id, entry_id, scores, comment, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(voter_id, entry_id) DO UPDATE SET
       scores = excluded.scores,
       comment = excluded.comment,
       updated_at = excluded.updated_at`,
  )
    .bind(voterId, entry.id, JSON.stringify(scores), comment)
    .run();

  return c.json({
    ballot: {
      entryId: entry.id,
      entryCode: entry.entry_code,
      scores,
      comment,
      updatedAt: new Date().toISOString(),
    },
  });
});

async function resultsPayload(env: Env, competition: CompetitionRow) {
  if (competition.snapshot) {
    const parsed = JSON.parse(competition.snapshot) as {
      beerList?: Array<{ entryCode?: string }>;
    };
    if (parsed.beerList?.[0]?.entryCode) return parsed;
  }
  return freeze(env, competition);
}

app.get("/api/results", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  const allowed =
    c.get("isAdmin") ||
    competition.status === "published" ||
    competition.status === "reveal";
  if (!allowed) return c.json({ error: "Results are locked" }, 403);
  return c.json(await resultsPayload(c.env, competition));
});

app.get("/api/reveal", async (c) => {
  const competition = await requireCompetition(c);
  if (!competition) return c.json({ error: "No competition" }, 404);
  const allowed =
    c.get("isAdmin") ||
    competition.status === "reveal" ||
    competition.status === "published";
  if (!allowed) return c.json({ error: "Reveal is locked" }, 403);
  return c.json(await resultsPayload(c.env, competition));
});

export default app;
