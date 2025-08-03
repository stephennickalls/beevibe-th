// server/api/hives/[id].get.js - Corrected with proper sensor field names
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== GET INDIVIDUAL HIVE START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
    if (!supabaseUrl || !anonKey) {
      console.error('Missing Supabase URL or anon key')
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    if (!serviceRoleKey) {
      console.error('Missing service role key')
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase service role key'
      })
    }

    // Step 1: Extract and validate authentication token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('No token in authorization header')
      throw createError({
        statusCode: 401,
        statusMessage: 'Valid token required'
      })
    }

    console.log('Token received, length:', token.length)

    // Step 2: Authenticate user with anon client
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError) {
      console.error('Auth error:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    if (!user) {
      console.error('No user returned from auth')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`)

    // Step 3: Get hive identifier from route params
    const hiveIdentifier = getRouterParam(event, 'id')
    if (!hiveIdentifier) {
      console.error('No hive identifier in route params')
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive identifier is required'
      })
    }

    console.log('Fetching hive:', hiveIdentifier, 'for user:', user.id)

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 4: Determine if identifier is UUID or ID and query accordingly
    let query = serviceClient
      .from('hives')
      .select(`
        id,
        uuid,
        name,
        description,
        apiary_id,
        installation_date,
        is_active,
        created_at,
        updated_at,
        user_id,
        created_by,
        apiary:apiaries(
          id,
          uuid,
          name,
          description,
          latitude,
          longitude,
          address
        ),
        sensors!sensors_hive_id_fkey(
          id,
          uuid,
          name,
          sensor_type,
          model,
          battery_level,
          is_online,
          last_reading_at,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)  // ← CRITICAL: Filter by user first
      .single()

    // Check if identifier looks like a UUID (contains hyphens) or is numeric
    if (hiveIdentifier.includes('-')) {
      // Looks like UUID
      console.log('Using UUID lookup for:', hiveIdentifier)
      query = query.eq('uuid', hiveIdentifier)
    } else {
      // Looks like numeric ID
      console.log('Using ID lookup for:', hiveIdentifier)
      query = query.eq('id', parseInt(hiveIdentifier))
    }

    const { data: hive, error: fetchError } = await query

    if (fetchError) {
      console.error('Hive fetch error:', fetchError)
      if (fetchError.code === 'PGRST116') {
        // No rows returned
        console.error(`Hive ${hiveIdentifier} not found for user ${user.id}`)
        throw createError({
          statusCode: 404,
          statusMessage: 'Hive not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${fetchError.message}`
      })
    }

    if (!hive) {
      console.error(`No hive data returned for ${hiveIdentifier} and user ${user.id}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found'
      })
    }

    // Verify ownership (double-check)
    if (hive.user_id !== user.id) {
      console.error(`Ownership mismatch: hive belongs to ${hive.user_id}, but user is ${user.id}`)
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found'
      })
    }

    console.log(`✅ Found hive: ${hive.name} (ID: ${hive.id}, UUID: ${hive.uuid}) for user ${user.id}`)
    console.log(`✅ Hive has ${hive.sensors?.length || 0} sensors`)

    // Step 5: Get recent alerts for this hive (optional enhancement)
    try {
      const { data: alerts } = await serviceClient
        .from('alerts')
        .select(`
          id,
          alert_type,
          severity,
          title,
          message,
          resolved,
          created_at
        `)
        .eq('hive_id', hive.id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5)

      // Add alerts to response
      hive.recent_alerts = alerts || []
    } catch (alertError) {
      console.warn('Failed to fetch alerts for hive:', alertError)
      hive.recent_alerts = []
    }

    console.log('=== GET INDIVIDUAL HIVE END ===')

    return {
      success: true,
      data: hive,
      debug: {
        authenticated_user: user.id,
        hive_identifier: hiveIdentifier,
        lookup_method: hiveIdentifier.includes('-') ? 'uuid' : 'id',
        hive_owner: hive.user_id,
        ownership_verified: hive.user_id === user.id,
        sensors_count: hive.sensors?.length || 0
      }
    }

  } catch (error) {
    console.error('Individual hive API error:', error)
    
    // If it's already a structured error, throw it as-is
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise wrap in a generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching hive details'
    })
  }
})