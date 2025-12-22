"use client"

import axios from "axios";
import { use } from "react";


const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/";

const apiClient = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true, // ✅ send cookies
});

// Automatically refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config.__isRetryRequest) {
      try {
        await axios.post(
          `${BASE_API_URL}users/refresh/`,
          null,
          { withCredentials: true }
        );
        error.config.__isRetryRequest = true;
        return apiClient(error.config); // retry the original request
      } catch (refreshError) {
        console.error("Refresh token invalid:", refreshError);
      }
    }
    throw error;
  }
);

export default apiClient;
