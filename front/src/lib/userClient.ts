"use client"

import apiClient from "./apiClient";

export const userApi = {
  login: (data: { email: string; password: string}) =>
    apiClient.post("/users/login/", data),

  register: (data: { email: string, password: string, username: string }) =>
    apiClient.post("/users/register/", data),

  me: () => apiClient.get("/users/me/"),

  logout: () => apiClient.post("/users/logout/"),

  refresh: () => apiClient.post("/users/refresh/", null, { withCredentials: true }),

};
