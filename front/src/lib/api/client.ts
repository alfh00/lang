// Django API client for making authenticated requests
// lib/api/client.ts


class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1") {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    let token: string | null = null    

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }


    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    })

    // if (!response.ok) {
    //   const errText = await response.text()
    //   throw new Error(`API Error: ${response.status} ${errText}`)
    // }

    if (response.status === 204) return {} as T
    return response.json()
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint, { method: "GET" }) }
  post<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined }) }
  patch<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }) }
  put<T>(endpoint: string, data?: unknown) { return this.request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined }) }
  delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: "DELETE" }) }
}
export const apiClient = new ApiClient()

export const authApi = {
  signIn: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/users/login/", { email, password }),

  signUp: (email: string, password: string, confirm_password: string, role: "student" | "teacher", fullName: string) =>
    apiClient.post<{ token: string; user: User }>("/auth/users/register/", { email, password, confirm_password, role, full_name: fullName }),

  signOut: () => apiClient.post("/auth/signout/", {}),

  // ✅ Server-side compatible
  getUser: () => apiClient.get<User>("/auth/users/me/"),
}

// User type
export interface User {
  id: string
  email: string
  full_name: string
  role: "student" | "teacher" | "admin"
  created_at: string
}

// Teachers API
export const teachersApi = {
  list: (params?: { search?: string; language?: string }) =>
    apiClient.get<Teacher[]>(`/teachers/${params ? `?${new URLSearchParams(params as any)}` : ""}`),

  get: (id: string) => apiClient.get<Teacher>(`/teachers/${id}/`),

  updateProfile: (data: Partial<Teacher>) => apiClient.patch<Teacher>("/teachers/profile/", data),

  updateAvailability: (availability: Availability[]) =>
    apiClient.post<Availability[]>("/teachers/availability/", { availability }),

  getAvailability: () => apiClient.get<Availability[]>("/teachers/availability/"),
}

// Bookings API
export const bookingsApi = {
  list: (params?: { status?: string; role?: string }) =>
    apiClient.get<Booking[]>(`/bookings/${params ? `?${new URLSearchParams(params as any)}` : ""}`),

  get: (id: string) => apiClient.get<Booking>(`/bookings/${id}/`),

  create: (data: { teacher_id: string; start_time: string; end_time: string }) =>
    apiClient.post<Booking>("/bookings/", data),

  cancel: (id: string) => apiClient.post<Booking>(`/bookings/${id}/cancel/`, {}),

  getAvailableSlots: (teacherId: string, date: string) =>
    apiClient.get<TimeSlot[]>(`/bookings/available-slots/?teacher_id=${teacherId}&date=${date}`),
}

// Payments API
export const paymentsApi = {
  createCheckout: (bookingId: string) =>
    apiClient.post<{ checkout_url: string }>("/payments/create-checkout/", { booking_id: bookingId }),

  refund: (paymentId: string) => apiClient.post<Payment>(`/payments/${paymentId}/refund/`, {}),

  list: () => apiClient.get<Payment[]>("/payments/"),
}

// Reviews API
export const reviewsApi = {
  create: (data: { booking_id: string; rating: number; comment?: string }) => apiClient.post<Review>("/reviews/", data),

  list: (teacherId?: string) => apiClient.get<Review[]>(`/reviews/${teacherId ? `?teacher_id=${teacherId}` : ""}`),
}

// Admin API
export const adminApi = {
  getStats: () => apiClient.get<AdminStats>("/admin/stats/"),

  listUsers: () => apiClient.get<User[]>("/admin/users/"),

  listBookings: () => apiClient.get<Booking[]>("/admin/bookings/"),

  listPayments: () => apiClient.get<Payment[]>("/admin/payments/"),
}

// Types
export interface User {
  id: string
  email: string
  full_name: string
  role: "student" | "teacher" | "admin"
  created_at: string
}

export interface Teacher extends User {
  bio?: string
  hourly_rate: number
  languages: string[]
  specialties: string[]
  profile_image?: string
  rating: number
  total_reviews: number
  total_lessons: number
}

export interface Availability {
  id?: string
  day_of_week: number // 0-6 (Monday-Sunday)
  start_time: string // HH:MM format
  end_time: string // HH:MM format
}

export interface Booking {
  id: string
  student: User
  teacher: Teacher
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_status: "pending" | "paid" | "refunded"
  video_url?: string
  created_at: string
}

export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
}

export interface Payment {
  id: string
  booking: Booking
  amount: number
  status: "pending" | "completed" | "refunded"
  stripe_payment_id?: string
  created_at: string
}

export interface Review {
  id: string
  booking: Booking
  student: User
  teacher: Teacher
  rating: number
  comment?: string
  created_at: string
}

export interface AdminStats {
  total_users: number
  total_students: number
  total_teachers: number
  total_bookings: number
  total_revenue: number
  pending_bookings: number
}
