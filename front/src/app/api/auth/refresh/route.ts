import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession, deleteSession } from "@/lib/bff/sessionStore"
import { refreshAccessToken } from "@/lib/bff/django"

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionId)

  if (!session || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const newAccessToken = await refreshAccessToken(session.refreshToken)
  if (!newAccessToken) {
    deleteSession(sessionId)
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(response)
    return response
  }

  updateSession(sessionId, { ...session, accessToken: newAccessToken, updatedAt: Date.now() })
  return NextResponse.json({ ok: true })
}
