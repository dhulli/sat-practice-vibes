import crypto from "crypto";

const COOKIE_NAME = "spv_session";
const SECRET = process.env.AUTH_SECRET;

if (!SECRET) throw new Error("AUTH_SECRET is not set in environment");

type SessionPayload = {
  v: 1;
  userId: string;
  email: string;
  iat: number;
};

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function sign(data: string) {
  return base64url(crypto.createHmac("sha256", SECRET!).update(data).digest());
}

export function buildSessionCookieValue(payload: Omit<SessionPayload, "v" | "iat">) {
  const full: SessionPayload = { v: 1, iat: Date.now(), ...payload };
  const body = base64url(JSON.stringify(full));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function verifySessionCookie(raw: string): SessionPayload | null {
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  if (sign(body) !== sig) return null;

  try {
    const json = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    if (json?.v !== 1) return null;
    return json as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
