export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
};

export function extractDriveId(url: string): string | null {
  try {
    const fileMatch = url.match(/\/folders\/([^/?#]+)/);
    const idParam = url.match(/[?&]id=([^&#]+)/);
    return (fileMatch?.[1] || idParam?.[1]) ?? null;
  } catch {
    return null;
  }
}

export async function listDriveFolder(folderUrl: string): Promise<DriveFile[]> {
  const id = extractDriveId(folderUrl);
  if (!id) return [];

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;
  if (apiKey) {
    console.info("[drive] Listing folder via Drive API", {
      folderUrl,
      folderId: id,
      hasApiKey: true,
    });
    const q = encodeURIComponent(`'${id}' in parents and trashed = false`);
    const fields = encodeURIComponent(
      "files(id,name,mimeType,thumbnailLink,webViewLink)"
    );
    const endpoint = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}`;
    const endpointLog = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=REDACTED`;
    console.debug("[drive] GET", endpointLog);
    const res = await fetch(endpoint, { cache: "no-store" });
    console.debug("[drive] Response", { status: res.status, ok: res.ok });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[drive] API error", {
        status: res.status,
        body: text.slice(0, 200),
      });
      throw new Error(`Drive API ${res.status}`);
    }
    const data = (await res.json()) as { files: DriveFile[] };
    console.info("[drive] API files", { count: data.files?.length ?? 0 });
    return data.files || [];
  }

  // Fallback: best-effort attempt to fetch the embedded folder view HTML and parse IDs.
  // Note: This can be blocked by CORS depending on Google. We swallow errors and return [].
  try {
    console.info("[drive] Using embeddedfolderview fallback", {
      folderUrl,
      folderId: id,
    });
    const url = `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
    const html = await (await fetch(url, { cache: "no-store" })).text();
    // Rough parse: look for data-id="<fileId>" occurrences
    const ids = Array.from(
      html.matchAll(/data-id="([a-zA-Z0-9_-]{10,})"/g)
    ).map((m) => m[1]);
    console.info("[drive] Fallback parsed ids", { count: ids.length });
    return ids.map((fid) => ({
      id: fid,
      name: fid,
      mimeType: "image/unknown",
      webViewLink: `https://drive.google.com/file/d/${fid}/view`,
      thumbnailLink: `https://drive.google.com/thumbnail?authuser=0&sz=w512&id=${fid}`,
    }));
  } catch {
    console.error("[drive] Fallback parsing failed (likely CORS)");
    return [];
  }
}

export function toDirectImageUrl(fileIdOrUrl: string): string {
  console.log("[drive] Converting to direct CDN URL:", fileIdOrUrl);
  // Accept either a pure file id or any known share url
  const idParam = fileIdOrUrl.match(/[?&]id=([^&#]+)/)?.[1];
  const fileMatch = fileIdOrUrl.match(/\/file\/d\/([^/]+)/)?.[1];
  const id = (fileMatch || idParam || fileIdOrUrl).trim();
  // Use googleusercontent host (public-friendly); allow Drive CDN to size via suffix
  const directUrl = `https://lh3.googleusercontent.com/d/${id}=w1200`;
  console.log("[drive] Converted URL:", directUrl);
  return directUrl;
}

// Extract a Drive file id from any known sharing URL or return the original if it already looks like an id
export function extractDriveFileId(urlOrId: string): string {
  const idParam = urlOrId.match(/[?&]id=([^&#]+)/)?.[1];
  const fileMatch = urlOrId.match(/\/file\/d\/([^/]+)/)?.[1];
  const fromUc = urlOrId.match(/uc\?[^#]*id=([^&#]+)/)?.[1];
  return (fileMatch || idParam || fromUc || urlOrId).trim();
}

export function extractDriveInfo(urlOrId: string): {
  id: string;
  resourceKey?: string;
} {
  const id = extractDriveFileId(urlOrId);
  const rkParam = urlOrId.match(/[?&]resourcekey=([^&#]+)/)?.[1];
  return { id, resourceKey: rkParam || undefined };
}
