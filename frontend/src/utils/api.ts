/**
 * Get the API base URL for making requests
 * In production (Vercel), uses the same domain with /api prefix
 * In development, uses localhost:8000 or NEXT_PUBLIC_API_BASE env var
 */
export function getApiBase(): string {
  // If we're in the browser and on Vercel production
  if (typeof window !== 'undefined') {
    // Check if we're on Vercel (production)
    const hostname = window.location.hostname;
    const isVercel = hostname.includes('vercel.app') || hostname.includes('vercel.com');
    
    if (isVercel) {
      // Use the same domain with /api prefix
      return `${window.location.protocol}//${window.location.host}/api`;
    }
  }
  
  // Use environment variable if set, otherwise fallback to localhost
  return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
}

export const API_BASE = getApiBase();

