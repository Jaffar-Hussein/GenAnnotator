// app/api/auth/[...route]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const SESSION_DURATION = 60 * 60; // 1 hour in seconds
const REFRESH_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  INVALID_SIGNUP: 'Registration failed',
  MISSING_REFRESH_TOKEN: 'Refresh token not found',
  SERVER_ERROR: 'An unexpected error occurred',
};

export async function POST(
  request: NextRequest,
  { params }: { params: { route: string[] } }
) {
  const route = params.route[0];
  console.log('🚀 Auth route handler:', route);

  try {
    switch (route) {
      case 'login':
        return handleLogin(request);
      case 'signup':
        return handleSignup(request);
      case 'refresh':
        return handleRefresh(request);
      case 'logout':
        return handleLogout();
      default:
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error(`Error in ${route}:`, error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}

async function handleSignup(request: NextRequest) {
  console.log('👤 Handle Signup Started');
  
  try {
    const body = await request.json();
    console.log('📝 Signup attempt for username:', body.username);

    const response = await fetch(`${BACKEND_URL}/access/api/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Signup failed:', data.error);
      return NextResponse.json(
        { error: data.error || ERROR_MESSAGES.INVALID_SIGNUP },
        { status: response.status }
      );
    }

    // Create API response
    const apiResponse = NextResponse.json({
      user: {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
      }
    });

    // Set cookies
    apiResponse.cookies.set('accessToken', data.access, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_DURATION,
    });

    apiResponse.cookies.set('refreshToken', data.refresh, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_DURATION,
    });

    console.log('✅ Signup successful, cookies set');
    return apiResponse;

  } catch (error) {
    console.error('💥 Signup error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}

async function handleRefresh(request: NextRequest) {
  console.log('🔄 Handle Refresh Started');

  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      console.error('❌ No refresh token found');
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REFRESH_TOKEN },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/access/api/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Token refresh failed');
      // Clear cookies on refresh failure
      const failureResponse = NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
      clearAuthCookies(failureResponse);
      return failureResponse;
    }

    const apiResponse = NextResponse.json({ success: true });

    // Set new access token
    apiResponse.cookies.set('accessToken', data.access, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_DURATION,
    });

    console.log('✅ Token refresh successful');
    return apiResponse;

  } catch (error) {
    console.error('💥 Refresh error:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.SERVER_ERROR },
      { status: 500 }
    );
  }
}

// ... (keep existing handleLogin and handleLogout functions)
async function handleLogin(request: NextRequest) {
    console.log('🔐 Handle Login Started');
    
    try {
      const body = await request.json();
      console.log('📝 Login attempt for username:', body.username);
  
      // Make request to backend
      const response = await fetch(`${BACKEND_URL}/access/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      console.log('🔑 Login response received');
  
      if (!response.ok) {
        console.error('❌ Login failed:', data.error);
        return NextResponse.json(
          { error: data.error || ERROR_MESSAGES.INVALID_CREDENTIALS },
          { status: response.status }
        );
      }
  
      // Create API response
      const apiResponse = NextResponse.json({
        user: {
          username: data.username,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
        }
      });
  
      // Set cookies
      apiResponse.cookies.set('accessToken', data.access, {
        ...COOKIE_OPTIONS,
        maxAge: SESSION_DURATION,
      });
  
      apiResponse.cookies.set('refreshToken', data.refresh, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_DURATION,
      });

      apiResponse.cookies.set('userRole', data.role, {
        ...COOKIE_OPTIONS,
        maxAge: SESSION_DURATION,
      });
  
      console.log('✅ Login successful, cookies set');
      return apiResponse;
  
    } catch (error) {
      console.error('💥 Login error:', error);
      return NextResponse.json(
        { error: ERROR_MESSAGES.SERVER_ERROR },
        { status: 500 }
      );
    }
  }
  
  async function handleLogout() {
    const response = NextResponse.json({ success: true });
    response.cookies.set('accessToken', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    response.cookies.set('refreshToken', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    response.cookies.set('userRole', '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });
    return response;
  }

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('accessToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set('refreshToken', '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}