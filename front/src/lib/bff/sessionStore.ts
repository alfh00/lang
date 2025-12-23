import { createHmac, timingSafeEqual } from "crypto"

export interface SessionUser {
  id: number
  email: string
  full_name: string
  timezone: string
  role: "student" | "teacher" | "admin"
}

export interface SessionData {
  accessToken: string
  refreshToken: string
  user: SessionUser
  updatedAt: number
}

const SESSION_SECRET = process.env.BFF_SESSION_SECRET || "dev-insecure-secret"

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8")
}

function sign(value: string) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url")
}

export function createSession(data: SessionData) {
  const payload = base64UrlEncode(JSON.stringify(data))
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function getSession(sessionToken: string | undefined) {
  if (!sessionToken) return null
  const [payload, signature] = sessionToken.split(".")
  if (!payload || !signature) return null
  const expected = sign(payload)
  if (expected.length !== signature.length) return null
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null
  try {
    return JSON.parse(base64UrlDecode(payload)) as SessionData
  } catch {
    return null
  }
}

export function updateSession(data: SessionData) {
  return createSession(data)
}

export function deleteSession() {}
