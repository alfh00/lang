import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession, deleteSession } from "@/lib/bff/sessionStore"
import { djangoFetch, refreshAccessToken } from "@/lib/bff/django"

export async function GET() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionId)

  if (!session || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let response = await djangoFetch("/auth/me/", { method: "GET" }, session.accessToken)

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken(session.refreshToken)
    if (newAccessToken) {
      updateSession(sessionId, { ...session, accessToken: newAccessToken, updatedAt: Date.now() })
      response = await djangoFetch("/auth/me/", { method: "GET" }, newAccessToken)
    }
  }

  if (!response.ok) {
    deleteSession(sessionId)
    const nextResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(nextResponse)
    return nextResponse
  }

  const data = await response.json()
  return NextResponse.json(data)
}
