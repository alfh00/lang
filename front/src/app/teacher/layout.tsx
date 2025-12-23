import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  if (!cookieHeader) {
    redirect("/auth/signin")
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const response = await fetch(`${origin}/api/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  })

  if (!response.ok) {
    redirect("/auth/signin")
  }

  const user = await response.json()
  if (user.role !== "teacher") {
    redirect(`/dashboard/${user.role}`)
  }

  return <>{children}</>
}
