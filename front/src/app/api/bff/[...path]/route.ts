import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SESSION_COOKIE, clearSessionCookie, setSessionCookie } from "@/lib/bff/cookies"
import { getSession, updateSession } from "@/lib/bff/sessionStore"
import { djangoFetch, refreshAccessToken } from "@/lib/bff/django"

async function handler(request: Request, params: { path: Promise<{ path: string[] }> | { path: string[] } }) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value
  const session = getSession(sessionToken)

  if (!session || !sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resolvedParams = "then" in params ? await params : params
  const urlPath = `/${resolvedParams.path.join("/")}/`
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
      const newSessionToken = updateSession({ ...session, accessToken: newAccessToken, updatedAt: Date.now() })
      response = await djangoFetch(
        urlPath,
        {
          method: request.method,
          body,
        },
        newAccessToken
      )
      if (response.ok) {
        const responseBody = await response.text()
        const nextResponse = new NextResponse(responseBody, {
          status: response.status,
          headers: {
            "Content-Type": response.headers.get("content-type") || "application/json",
          },
        })
        setSessionCookie(nextResponse, newSessionToken)
        return nextResponse
      }
    }
  }

  if (response.status === 401) {
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

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return handler(request, context.params)
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return handler(request, context.params)
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return handler(request, context.params)
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return handler(request, context.params)
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  return handler(request, context.params)
}
