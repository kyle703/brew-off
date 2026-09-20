const encoder = new TextEncoder();

async function hmacHex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signValue(secret: string, payload: string): Promise<string> {
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifyValue(
  secret: string,
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  const cut = token.lastIndexOf(".");
  if (cut <= 0) return null;
  const payload = token.slice(0, cut);
  const sig = token.slice(cut + 1);
  const expected = await hmacHex(secret, payload);
  if (sig.length !== expected.length) return null;
  let ok = 0;
  for (let i = 0; i < sig.length; i++) ok |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return ok === 0 ? payload : null;
}
