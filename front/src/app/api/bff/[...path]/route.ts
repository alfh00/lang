import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession, deleteSession } from "@/lib/bff/sessionStore"
import { djangoFetch, refreshAccessToken } from "@/lib/bff/django"

async function handler(request: Request, params: { path: string[] }) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionId)

  if (!session || !sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const urlPath = `/${params.path.join("/")}/`
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()

  let response = await djangoFetch(
    urlPath,
    {
      method: request.method,
      body,
    },
    session.accessToken
  )

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken(session.refreshToken)
    if (newAccessToken) {
      updateSession(sessionId, { ...session, accessToken: newAccessToken, updatedAt: Date.now() })
      response = await djangoFetch(
        urlPath,
        {
          method: request.method,
          body,
        },
        newAccessToken
      )
    }
  }

  if (response.status === 401) {
    deleteSession(sessionId)
    const nextResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(nextResponse)
    return nextResponse
  }

  const contentType = response.headers.get("content-type") || "application/json"
  const responseBody = await response.text()

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "Content-Type": contentType,
    },
  })
}

export async function GET(request: Request, context: { params: { path: string[] } }) {
  return handler(request, context.params)
}

export async function POST(request: Request, context: { params: { path: string[] } }) {
  return handler(request, context.params)
}

export async function PUT(request: Request, context: { params: { path: string[] } }) {
  return handler(request, context.params)
}

export async function PATCH(request: Request, context: { params: { path: string[] } }) {
  return handler(request, context.params)
}

export async function DELETE(request: Request, context: { params: { path: string[] } }) {
  return handler(request, context.params)
}
