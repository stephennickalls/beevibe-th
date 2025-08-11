// server/api/apiaries/[id].get.js - Updated to handle UUID lookups like hives API
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== APIARY DETAILS API START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey
    
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
      console.warn('No service role key - using anon client only')
    }

    // Step 1: Get apiary identifier from route
    const apiaryIdentifier = getRouterParam(event, 'id')
    console.log('Apiary identifier:', apiaryIdentifier)
    
    if (!apiaryIdentifier) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Apiary identifier is required'
      })
    }

    // Step 2: Authenticate user with anon client
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No authorization header'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    console.log('Authenticated user:', user.id)

    // Step 3: Use service role client if available, otherwise use auth client
    const dbClient = serviceRoleKey ? 
      createClient(supabaseUrl, serviceRoleKey) : authClient

    // Step 4: Determine if identifier is UUID or ID and query accordingly
    let apiaryQuery = dbClient
      .from('apiaries')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check if identifier looks like a UUID (contains hyphens) or is numeric
    if (apiaryIdentifier.includes('-')) {
      // Looks like UUID
      console.log('Using UUID lookup for apiary:', apiaryIdentifier)
      apiaryQuery = apiaryQuery.eq('uuid', apiaryIdentifier)
    } else {
      // Looks like numeric ID
      console.log('Using ID lookup for apiary:', apiaryIdentifier)
      apiaryQuery = apiaryQuery.eq('id', parseInt(apiaryIdentifier))
    }

    const { data: apiary, error: apiaryError } = await apiaryQuery

    if (apiaryError) {
      console.error('Error fetching apiary:', apiaryError)
      if (apiaryError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Apiary not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch apiary: ${apiaryError.message}`
      })
    }

    console.log('Apiary found:', apiary?.name)

    // Step 5: Get hives for this apiary with sensor counts
    const { data: hives, error: hivesError } = await dbClient
      .from('hives')
      .select(`
        id,
        uuid,
        name,
        description,
        installation_date,
        is_active,
        created_at,
        updated_at,
        sensor_count:sensors(count)
      `)
      .eq('apiary_id', apiary.id)
      .order('created_at', { ascending: false })

    if (hivesError) {
      console.warn('Error fetching hives for apiary', apiary.id, ':', hivesError)
    }

    // Process sensor counts for each hive
    const processedHives = (hives || []).map(hive => ({
      ...hive,
      sensor_count: hive.sensor_count?.[0]?.count || 0
    }))

    console.log('Found hives:', processedHives.length)

    // Step 6: Combine apiary with its hives
    const apiaryWithHives = {
      ...apiary,
      hives: processedHives,
      hive_count: processedHives.length
    }

    console.log('=== APIARY DETAILS API END ===')

    return {
      data: apiaryWithHives,
      debug: {
        user_id: user.id,
        apiary_identifier: apiaryIdentifier,
        apiary_id: apiary.id,
        apiary_uuid: apiary.uuid,
        hive_count: processedHives.length,
        using_service_role: !!serviceRoleKey
      }
    }
    
  } catch (error) {
    console.error('Get apiary details error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch apiary details'
    })
  }
})