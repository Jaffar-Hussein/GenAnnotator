import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Define which roles can access which paths
const ROLE_PERMISSIONS = {
  '/admin': ['ADMIN', 'ANNOTATOR', 'READER','VALIDATOR'],
  '/dashboard': ['ADMIN', 'ANNOTATOR', 'READER','VALIDATOR'],
  '/editor': ['ADMIN', 'WRITER'],
  '/profile': ['ADMIN', 'ANNOTATOR', 'READER','VALIDATOR'],
} as const;

// Add paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/',
  '/about',
  '/api/auth/login',
  '/api/auth/refresh',
  '/documentation',
  '/gene-assignment',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware running for', pathname);

  // Check if path is public - exact match or API route
  const isPublicPath = PUBLIC_PATHS.includes(pathname) || 
                      pathname.startsWith('/api/auth/') ||
                      pathname === '/';
                      
  if (isPublicPath) {
    console.log('Public path accessed:', pathname);
    return NextResponse.next();
  }

  console.log('Protected path accessed:', pathname);

  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    console.log('Access token present:', !!accessToken);
    
    if (!accessToken) {
      console.log('No access token, redirecting to login');
      return redirectToLogin(request);
    }

    // Decode token and check expiration
    const decoded = jwtDecode<{ exp: number; user_id: number }>(accessToken);
    const isExpired = decoded.exp * 1000 < Date.now();
    console.log('Token expiration status:', { isExpired, exp: decoded.exp });
    
    if (isExpired) {
      console.log('Token expired, redirecting to login');
      return redirectToLogin(request);
    }

    // Get user data from auth-storage cookie
    const authStorageCookie = request.cookies.get('auth-storage')?.value;
    console.log('Auth storage present:', !!authStorageCookie);
    
    if (!authStorageCookie) {
      console.log('No auth storage, redirecting to login');
      return redirectToLogin(request);
    }

    let userData;
    try {
      userData = JSON.parse(decodeURIComponent(authStorageCookie));
      console.log('User data parsed:', {
        hasState: !!userData?.state,
        hasUser: !!userData?.state?.user,
        role: userData?.state?.user?.role
      });
    } catch (e) {
      console.log('Failed to parse auth storage:', e);
      return redirectToLogin(request);
    }

    const userRole = userData?.state?.user?.role;
    console.log('User role:', userRole);

    if (!userRole) {
      console.log('No user role found, redirecting to login');
      return redirectToLogin(request);
    }

    // Check role-based access
    const pathToCheck = Object.keys(ROLE_PERMISSIONS).find(
      path => pathname.startsWith(path)
    );
    
    if (pathToCheck) {
      const requiredRoles = ROLE_PERMISSIONS[pathToCheck as keyof typeof ROLE_PERMISSIONS];
      console.log('Role check:', {
        pathToCheck,
        requiredRoles,
        userRole,
        hasAccess: requiredRoles.includes(userRole)
      });

      if (!requiredRoles.includes(userRole)) {
        console.log('Access denied, redirecting to 403');
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }

    console.log('Access granted for path:', pathname);
    return NextResponse.next();
  } catch (error) {
    console.log('Middleware error:', error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};