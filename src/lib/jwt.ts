import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

const getSecret = () => {
  const secret = process.env.JWT_SECRET || "streamvault-secret-key-change-in-production-2024";
  return new TextEncoder().encode(secret);
};

export interface JWTUserPayload extends JWTPayload {
  userId: string;
  username: string;
  role: "admin" | "user";
}

/**
 * Create a signed JWT token with 4-day expiry
 */
export async function createJWT(payload: { userId: string; username: string; role: string }): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("4d")
    .sign(getSecret());
  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token: string): Promise<JWTUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as JWTUserPayload;
  } catch {
    return null;
  }
}

/**
 * Set the JWT as a secure, httpOnly, encrypted cookie
 */
export function setAuthCookie(response: Response, token: string): void {
  const maxAge = 4 * 24 * 60 * 60; 
  const isProduction = process.env.NODE_ENV === "production";

  const cookieValue = [
    `session=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  response.headers.append("Set-Cookie", cookieValue);
}

/**
 * Extract JWT payload from request cookies (for API routes)
 */
export async function getJWTUser(request: Request): Promise<JWTUserPayload | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("session="));

  if (!sessionCookie) return null;

  const token = sessionCookie.split("=").slice(1).join("=");
  return verifyJWT(token);
}
