import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie, setSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession } from "@/lib/bff/sessionStore"
import { refreshAccessToken } from "@/lib/bff/django"

export async function POST() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionToken)

  if (!session || !sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const newAccessToken = await refreshAccessToken(session.refreshToken)
  if (!newAccessToken) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(response)
    return response
  }

  const newSessionToken = updateSession({ ...session, accessToken: newAccessToken, updatedAt: Date.now() })
  const response = NextResponse.json({ ok: true })
  setSessionCookie(response, newSessionToken)
  return response
}
