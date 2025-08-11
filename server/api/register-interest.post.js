// server/api/register-interest.post.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Get and validate request body
    const body = await readBody(event)
    const { name, email } = body

    // Server-side validation
    if (!name || !name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      })
    }

    if (!email || !email.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Create service client for database operations
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Check if email already exists (optional)
    const { data: existingEntry } = await serviceClient
      .from('register_interest')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingEntry) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already registered'
      })
    }

    // Insert into database
    const { data, error: dbError } = await serviceClient
      .from('register_interest')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase()
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${dbError.message}`
      })
    }

    // Return success response
    return { 
      success: true,
      message: 'Interest registered successfully',
      data 
    }

  } catch (error) {
    console.error('Register interest error:', error)
    
    // Return appropriate error response
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to register interest'
    })
  }
})