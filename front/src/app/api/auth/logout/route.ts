import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/bff/cookies"
import { getSession, deleteSession } from "@/lib/bff/sessionStore"
import { djangoFetch } from "@/lib/bff/django"

export async function POST() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionId)

  if (session) {
    await fetch(`${process.env.DJANGO_API_URL || "http://localhost:8000/api/v1"}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `access_token=${session.accessToken}; refresh_token=${session.refreshToken}`,
      },
    })
    deleteSession(sessionId)
  }

  const response = NextResponse.json({ ok: true })
  clearSessionCookie(response)
  return response
}
