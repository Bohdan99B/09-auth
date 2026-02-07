import axios from 'axios';

const isBrowser = typeof window !== 'undefined';

const serverOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const origin = isBrowser ? window.location.origin : serverOrigin;

const baseURL = `${origin}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
