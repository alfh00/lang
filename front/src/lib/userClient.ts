"use client"

import axios from "axios"
import apiClient from "./apiClient"

export type Role = "student" | "teacher" | "admin"

export interface User {
  id: number
  email: string
  full_name: string
  timezone: string
  role: Role
}

const authClient = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
})

export const authApi = {
  login: (data: { email: string; password: string }) =>
    authClient.post<{ user: User }>("/login", data),
  register: (data: { email: string; password: string; full_name: string; timezone: string; role: "student" | "teacher" }) =>
    authClient.post<{ user: User }>("/register", data),
  me: () => authClient.get<User>("/me"),
  logout: () => authClient.post("/logout"),
  refresh: () => authClient.post("/refresh"),
}

export interface StudentProfile {
  id: number
  email: string
  full_name: string
  timezone: string
  role: Role
  cefr_level: string
  preparing_for: string
  target_field: string
  target_field_other_text: string
  target_start_date: string | null
  target_start_date_unknown: boolean
  focus_skills: string[]
  learning_style: string[]
  weekly_time_budget_hours: number | null
  preferred_session_duration: number | null
  books_resources_text: string
  homework_preference: string
  availability_notes: string
  goals_summary: string
  terms_accepted_at: string | null
  privacy_accepted_at: string | null
  application_status: string
  submitted_at: string | null
  matched_teacher: number | null
  onboarding_notes: string
  completion_percent: number
}

export const studentApi = {
  me: () => apiClient.get<StudentProfile>("/students/me/"),
  update: (data: Partial<StudentProfile>) => apiClient.put<StudentProfile>("/students/me/", data),
  submitApplication: () => apiClient.post<StudentProfile>("/students/me/submit-application/"),
}

export interface TeacherProfile {
  id: number
  email: string
  full_name: string
  timezone: string
  role: Role
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
  requested_by_role: Role
  meeting_url: string | null
  notes: string | null
}

export const lessonsApi = {
  list: () => apiClient.get<Lesson[]>("/lessons/"),
  get: (id: number) => apiClient.get<Lesson>(`/lessons/${id}/`),
  request: (data: { starts_at_utc: string; duration_minutes: number }) =>
    apiClient.post<Lesson>("/lessons/", data),
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
