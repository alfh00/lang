import { authApi } from "@/lib/api/client"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Call Django API to sign out
    await authApi.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }

  // Clear auth token cookie
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"))
}
