export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL as string,
  authSecret: process.env.AUTH_SECRET || 'your-development-secret-key',
};