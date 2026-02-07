import axios from 'axios';

const isBrowser = typeof window !== 'undefined';

const origin = isBrowser
  ? window.location.origin
  : process.env.NEXT_PUBLIC_API_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const baseURL = `${origin}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});
