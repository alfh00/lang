import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const origin = new URL(request.url).origin
  const cookieHeader = request.headers.get("cookie") || ""
  try {
    await fetch(`${origin}/api/auth/logout`, {
      method: "POST",
      headers: { cookie: cookieHeader },
      cache: "no-store",
    })
  } catch (error) {
    console.error("Sign out error:", error)
  }

  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
  response.cookies.delete("bff_session")
  return response
}
