import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define role permissions mapping
const ROLE_PERMISSIONS = {
  '/admin': ['ADMIN'],
  '/dashboard': ['ADMIN', 'VALIDATOR', 'ANNOTATOR', 'READER'],
  '/profile': ['ADMIN', 'VALIDATOR', 'ANNOTATOR', 'READER'],
  '/gene-assignment': ['ADMIN', 'VALIDATOR'],
  '/my-annotations': ['ADMIN', 'VALIDATOR', 'ANNOTATOR'],
  '/gene-validation': ['ADMIN', 'VALIDATOR'],
} as const;

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/',
  '/about',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/signup',
  '/manifest.json',
  '/favicon.ico',
];

// Updated token interface to match your JWT structure
interface DecodedToken {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname) ||
         pathname.startsWith('/api/auth/') ||
         pathname.startsWith('/_next/') ||
         pathname === '/';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('🚀 Middleware running for path:', pathname);

  // Check if it's a public path first
  if (isPublicPath(pathname)) {
    console.log('✅ Allowing access to public path:', pathname);
    return NextResponse.next();
  }

  try {
    // Get access token and user role from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const userRole = request.cookies.get('userRole')?.value; 
    console.log('🍪 Access Token:', accessToken ? 'Token exists' : 'No token');
    console.log('🍪 User Role:', userRole || 'No role');
    console.log('📜 All cookies:', request.cookies.getAll());
    
    console.log('🔑 Access Token present:', !!accessToken);
    console.log('👑 User Role from cookie:', userRole);

    if (!accessToken || !userRole) {
      console.log('❌ Missing token or role, redirecting to login');
      return redirectToLogin(request);
    }

    // Decode token for expiration check
    const decoded = jwtDecode<DecodedToken>(accessToken);
    console.log('👤 Decoded token:', {
      userId: decoded.user_id,
      role: userRole,
      expiration: new Date(decoded.exp * 1000).toISOString()
    });

    // Check token expiration
    const isExpired = decoded.exp * 1000 < Date.now();
    console.log('⌛ Token expired:', isExpired);

    if (isExpired) {
      console.log('⌛ Token expired, attempting refresh');
      return redirectToLogin(request);
    }

    // Check role-based access
    const pathToCheck = Object.keys(ROLE_PERMISSIONS).find(
      path => pathname.startsWith(path)
    );

    if (pathToCheck) {
      const requiredRoles = ROLE_PERMISSIONS[pathToCheck as keyof typeof ROLE_PERMISSIONS];
      console.log('🎭 Required roles:', requiredRoles);
      console.log('👑 User role:', userRole);

      if (!requiredRoles.includes(userRole as any)) {
        console.log('🚫 Access denied for path:', pathname);
        console.log('🚫 User role:', userRole);
        console.log('🚫 Required roles:', requiredRoles);
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    // Add security headers
    const response = NextResponse.next();
    

    return response;

  } catch (error) {
    console.error('💥 Middleware error:', error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  console.log('↩️ Redirecting to:', loginUrl.toString());
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};