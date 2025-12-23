const DJANGO_API_BASE = process.env.DJANGO_API_URL || "http://localhost:8000/api/v1"

export function djangoFetch(path: string, options: RequestInit = {}, accessToken?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (accessToken) {
    headers["cookie"] = `access_token=${accessToken}`
  }

  return fetch(`${DJANGO_API_BASE}${path}`, {
    ...options,
    headers,
  })
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${DJANGO_API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: `refresh_token=${refreshToken}`,
    },
  })

  if (!response.ok) return null
  const data = await response.json()
  return data.access_token as string | undefined
}
