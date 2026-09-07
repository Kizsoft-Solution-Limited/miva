import axios from 'axios'

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  '/api'

export const http = axios.create({
  baseURL,
  timeout: 90_000,
  withCredentials: true,
})
