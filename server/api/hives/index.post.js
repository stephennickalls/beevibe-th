// server/api/hives/index.post.js - COMPLETE FIXED VERSION
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CREATE HIVE START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI1NTY1MCwiZXhwIjoyMDUyODMxNjUwfQ.VVEw8Bob9AjV_WeBsVHLdNKMRUWq2QLeBHAG8o1is7s'
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Step 1: Authenticate user with anon key
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    console.log('Creating hive for user:', user.id)

    // Step 2: Get request body and validate
    const body = await readBody(event)
    
    if (!body.name || !body.name.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive name is required'
      })
    }

    // Step 3: Check current usage and limits (simplified)
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Get current hive count for user
    const { count: currentHives } = await serviceClient
      .from('hives')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true)

    console.log('Current hives:', currentHives)

    // Simple limit check - allow up to 10 hives per user
    if (currentHives >= 10) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Hive limit reached. You can have up to 10 hives.'
      })
    }

    // Step 4: Create new hive
    const newHive = {
      user_id: user.id,
      created_by: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      installation_date: body.installation_date || new Date().toISOString().split('T')[0],
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting hive:', newHive)

    // Use service role to insert (bypasses RLS)
    const { data, error } = await serviceClient
      .from('hives')
      .insert([newHive])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${error.message}`
      })
    }

    console.log('✅ Hive created successfully:', data)
    console.log('=== CREATE HIVE END ===')
    
    return { 
      data,
      subscription_info: {
        plan: 'free',
        hives_used: currentHives + 1,
        hives_limit: 10,
        sensors_used: 0,
        sensors_limit: 30
      }
    }
    
  } catch (error) {
    console.error('Create hive error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create hive'
    })
  }
})