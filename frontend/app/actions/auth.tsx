'use server'

import { cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Please fill in all fields.' }
  }

  try {
    const response = await fetch('http://localhost:8000/access/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || 'Invalid credentials' }
    }

    const { access, refresh } = await response.json()

    // Set cookies securely
    // cookies().set('accessToken', access, { 
    //   httpOnly: true, 
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 15 * 60, // 15 minutes
    // })
    // cookies().set('refreshToken', refresh, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60, // 7 days
    // })

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'An error occurred. Please try again.' }
  }
}

export async function changePassword(prevState: any, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Please fill in all fields.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }

  const accessToken = cookies().get('accessToken')?.value

  if (!accessToken) {
    return { error: 'You must be logged in to change your password.' }
  }

  try {
    const response = await fetch('http://localhost:8000/access/api/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || 'Failed to change password' }
    }

    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { error: 'An error occurred. Please try again.' }
  }
}

