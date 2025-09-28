import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth-session';
const AUTH_COOKIE_VALUE = 'authenticated';

export interface AuthResult {
  success: boolean;
  message?: string;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const appPassword = process.env.APP_PASSWORD;
  
  if (!appPassword) {
    console.error('APP_PASSWORD environment variable is not set');
    return false;
  }
  
  // For simplicity, we'll do a direct comparison
  // In production, you might want to hash the password
  return password === appPassword;
}

export function setAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE_NAME);
}

export function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  return authCookie?.value === AUTH_COOKIE_VALUE;
}

export function createAuthenticatedResponse(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  
  // Check if user is authenticated
  if (!isAuthenticated(request)) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}