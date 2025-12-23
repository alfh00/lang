import { randomUUID } from "crypto"
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

const sessions = new Map<string, SessionData>()

export function createSession(data: SessionData) {
  const sessionId = randomUUID()
  sessions.set(sessionId, data)
  return sessionId
}

export function getSession(sessionId: string | undefined) {
  if (!sessionId) return null
  return sessions.get(sessionId) || null
}

export function updateSession(sessionId: string, data: SessionData) {
  sessions.set(sessionId, data)
}

export function deleteSession(sessionId: string | undefined) {
  if (!sessionId) return
  sessions.delete(sessionId)
}
