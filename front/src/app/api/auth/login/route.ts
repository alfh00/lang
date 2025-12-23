import { NextResponse } from "next/server"
import { createSession } from "@/lib/bff/sessionStore"
import { setSessionCookie } from "@/lib/bff/cookies"
import { djangoFetch } from "@/lib/bff/django"

export async function POST(request: Request) {
  const body = await request.json()
  const response = await djangoFetch("/auth/login/", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status })
  }

  const sessionId = createSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
    updatedAt: Date.now(),
  })

  const nextResponse = NextResponse.json({ user: data.user })
  setSessionCookie(nextResponse, sessionId)
  return nextResponse
}
