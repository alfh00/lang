// src/lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Simple client-side helper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token")
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }
  if (token) headers["Authorization"] = `Token ${token}`

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })
  if (!res.ok) throw new Error(`API Error ${res.status}`)
  return res.json()
}

// Example auth API (client-side)
export const authApi = {
  signIn: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>("/auth/users/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signUp: (email: string, password: string, confirm_password: string, role: "student" | "teacher", fullName: string) =>
    apiRequest<{ token: string; user: User }>("/auth/users/register/", {
      method: "POST",
      body: JSON.stringify({ email, password, confirm_password, role, full_name: fullName }),
    }),
}
