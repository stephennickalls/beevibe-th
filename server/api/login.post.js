// server/api/login.post.js - Login endpoint
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  )

  try {
    // Get user from Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // Create JWT token
    const tokenPayload = {
      userId: authData.user.id,
      email: authData.user.email,
      username: profile?.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const token = jwt.sign(tokenPayload, config.jwtSecret)

    return {
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: profile?.username
      }
    }
  } catch (error) {
    if (error.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed'
    })
  }
})