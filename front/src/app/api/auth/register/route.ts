import { NextResponse } from "next/server"
import { djangoFetch } from "@/lib/bff/django"

export async function POST(request: Request) {
  const body = await request.json()
  const response = await djangoFetch("/auth/register/", {
    method: "POST",
    body: JSON.stringify(body),
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
