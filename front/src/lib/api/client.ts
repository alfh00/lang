// Django API client for making authenticated requests
// lib/api/client.ts

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = "/api/bff") {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    })

    if (response.status === 204) return {} as T
    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" })
  }
  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined })
  }
  put<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined })
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()

export interface User {
  id: number
  email: string
  full_name: string
  timezone: string
  role: "student" | "teacher" | "admin"
}

const authClient = new ApiClient("/api/auth")

export const authApi = {
  signIn: (email: string, password: string) => authClient.post<{ user: User }>("/login", { email, password }),
  signUp: (email: string, password: string, role: "student" | "teacher", fullName: string, timezone: string) =>
    authClient.post<{ user: User }>("/register", { email, password, role, full_name: fullName, timezone }),
  signOut: () => authClient.post("/logout", {}),
  getUser: () => authClient.get<User>("/me"),
}

export interface StudentProfile {
  id: number
  email: string
  full_name: string
  timezone: string
  role: "student" | "teacher" | "admin"
  application_status: string
  submitted_at: string | null
  matched_teacher: number | null
  onboarding_notes: string
  completion_percent: number
}

export const studentApi = {
  me: () => apiClient.get<StudentProfile>("/students/me/"),
  update: (data: Partial<StudentProfile>) => apiClient.put<StudentProfile>("/students/me/", data),
  submitApplication: () => apiClient.post<StudentProfile>("/students/me/submit-application/", {}),
}

export interface TeacherProfile {
  id: number
  email: string
  full_name: string
  timezone: string
  role: "student" | "teacher" | "admin"
  languages: string[]
  teaching_tracks: string[]
  levels_supported: string[]
  bio_short: string
  active: boolean
  availability_notes: string
}

export const teacherApi = {
  me: () => apiClient.get<TeacherProfile>("/teachers/me/"),
  update: (data: Partial<TeacherProfile>) => apiClient.put<TeacherProfile>("/teachers/me/", data),
  list: () => apiClient.get<TeacherProfile[]>("/teachers/"),
}

export interface AvailabilityBlock {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration: number
}

export const availabilityApi = {
  list: () => apiClient.get<AvailabilityBlock[]>("/teachers/me/availability-blocks/"),
  create: (data: Omit<AvailabilityBlock, "id">) => apiClient.post<AvailabilityBlock>("/teachers/me/availability-blocks/", data),
  update: (id: number, data: Omit<AvailabilityBlock, "id">) =>
    apiClient.put<AvailabilityBlock>(`/teachers/me/availability-blocks/${id}/`, data),
  remove: (id: number) => apiClient.delete(`/teachers/me/availability-blocks/${id}/`),
}

export interface Lesson {
  id: number
  student: number
  teacher: number
  starts_at_utc: string
  ends_at_utc: string
  duration_minutes: number
  status: "requested" | "proposed" | "confirmed" | "canceled" | "completed"
  requested_by_role: "student" | "teacher" | "admin"
  meeting_url: string | null
  notes: string | null
}

export const lessonsApi = {
  list: () => apiClient.get<Lesson[]>("/lessons/"),
  get: (id: number) => apiClient.get<Lesson>(`/lessons/${id}/`),
  request: (data: { starts_at_utc: string; duration_minutes: number }) => apiClient.post<Lesson>("/lessons/", data),
  propose: (id: number, data: { starts_at_utc: string; duration_minutes: number }) =>
    apiClient.post<Lesson>(`/lessons/${id}/propose/`, data),
  confirm: (id: number) => apiClient.post<Lesson>(`/lessons/${id}/confirm/`, {}),
  cancel: (id: number) => apiClient.post<Lesson>(`/lessons/${id}/cancel/`, {}),
}

export const adminApi = {
  listApplications: (status?: string) =>
    apiClient.get<StudentProfile[]>(`/admin/applications/${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getApplication: (id: number) => apiClient.get<StudentProfile>(`/admin/applications/${id}/`),
  addNotes: (id: number, notes: string) => apiClient.post<StudentProfile>(`/admin/applications/${id}/notes/`, { notes }),
  matchTeacher: (id: number, teacher_id: number) =>
    apiClient.post<StudentProfile>(`/admin/applications/${id}/match/`, { teacher_id }),
}
