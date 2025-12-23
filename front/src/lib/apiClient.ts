"use client"

import axios from "axios"

const BASE_API_URL = "/api/bff"

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
})

// Automatically refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const requestUrl = error.config?.url || ""
    const isAuthEndpoint = requestUrl.includes("/auth/login/") ||
      requestUrl.includes("/auth/register/") ||
      requestUrl.includes("/auth/refresh/") ||
      requestUrl.includes("/auth/me/")

    if (error.response?.status === 401 && !error.config.__isRetryRequest && !isAuthEndpoint) {
      try {
        await axios.post("/api/auth/refresh/", null, { withCredentials: true })
        error.config.__isRetryRequest = true
        return apiClient(error.config)
      } catch (refreshError) {
        console.error("Refresh token invalid:", refreshError)
      }
    }
    throw error
  }
)

export default apiClient
