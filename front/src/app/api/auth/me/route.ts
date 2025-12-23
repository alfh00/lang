import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie, setSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession } from "@/lib/bff/sessionStore"
import { djangoFetch, refreshAccessToken } from "@/lib/bff/django"

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionToken)

  if (!session || !sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let response = await djangoFetch("/auth/me/", { method: "GET" }, session.accessToken)

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken(session.refreshToken)
    if (newAccessToken) {
      const newSessionToken = updateSession({ ...session, accessToken: newAccessToken, updatedAt: Date.now() })
      response = await djangoFetch("/auth/me/", { method: "GET" }, newAccessToken)
      if (response.ok) {
        const nextResponse = NextResponse.json(await response.clone().json())
        setSessionCookie(nextResponse, newSessionToken)
        return nextResponse
      }
    }
  }

  if (!response.ok) {
    const nextResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(nextResponse)
    return nextResponse
  }

  const data = await response.json()
  return NextResponse.json(data)
}
