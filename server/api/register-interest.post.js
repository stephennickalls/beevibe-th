// server/api/register-interest.post.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== REGISTER INTEREST API START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Config check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceRoleKey
    })
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      console.warn('No service role key - using anon client')
      // For register interest, we might not need service role
    }

    // Get and validate request body
    const body = await readBody(event)
    console.log('Request body received:', { name: !!body?.name, email: !!body?.email })
    
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

    // Create client (use service role if available, otherwise anon key should work for public table)
    const clientKey = serviceRoleKey || anonKey
    const client = createClient(supabaseUrl, clientKey)

    const cleanEmail = email.trim().toLowerCase()
    console.log('Processing registration for email:', cleanEmail)

    // Check if email already exists
    const { data: existingEntry, error: checkError } = await client
      .from('register_interest')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

    if (checkError) {
      console.error('Database check error:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${checkError.message}`
      })
    }

    if (existingEntry) {
      console.log('Email already exists:', cleanEmail)
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already registered'
      })
    }

    console.log('Email not found, proceeding with insert')

    // Insert into database - removed the .select().single() chain that was causing issues
    const { data, error: dbError } = await client
      .from('register_interest')
      .insert({
        name: name.trim(),
        email: cleanEmail
      })
      .select('id, name, email, created_at')

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Handle specific PostgreSQL errors
      if (dbError.code === '23505') { // Unique constraint violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Email already registered'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${dbError.message}`
      })
    }

    console.log('Successfully inserted:', data)

    // Return success response
    return {
      success: true,
      message: 'Interest registered successfully',
      data: data?.[0] || data // Handle both array and single object responses
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