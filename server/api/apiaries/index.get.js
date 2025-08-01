// server/api/apiaries/index.get.js - Fixed with debugging and service role key
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== APIARIES API START ===')
    
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

    // Step 1: Authenticate user with anon client
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

    // Step 2: Use service role client if available, otherwise use auth client
    const dbClient = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : authClient

    // Step 3: First, get basic apiaries without aggregation
    console.log('Fetching apiaries for user:', user.id)
    const { data: apiaries, error: apiariesError } = await dbClient
      .from('apiaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (apiariesError) {
      console.error('Error fetching apiaries:', apiariesError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch apiaries: ${apiariesError.message}`
      })
    }

    console.log('Raw apiaries found:', apiaries?.length || 0)
    console.log('First apiary:', apiaries?.[0])

    // Step 4: Get hives for each apiary and include count
    const apiariesWithHives = await Promise.all(
      (apiaries || []).map(async (apiary) => {
        // Get hives for this apiary
        const { data: hives, error: hivesError } = await dbClient
          .from('hives')
          .select(`
            id,
            name,
            description,
            installation_date,
            is_active,
            sensor_count:sensors(count)
          `)
          .eq('apiary_id', apiary.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (hivesError) {
          console.warn('Error fetching hives for apiary', apiary.id, ':', hivesError)
        }

        // Process sensor counts for each hive
        const processedHives = (hives || []).map(hive => ({
          ...hive,
          sensor_count: hive.sensor_count?.[0]?.count || 0
        }))

        return {
          ...apiary,
          hives: processedHives,
          hive_count: processedHives.length
        }
      })
    )

    console.log('Final apiaries with hives:', apiariesWithHives.length)

    return {
      data: apiariesWithHives,
      count: apiariesWithHives.length,
      debug: {
        user_id: user.id,
        raw_count: apiaries?.length || 0,
        using_service_role: !!serviceRoleKey
      }
    }
    
  } catch (error) {
    console.error('Get apiaries error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch apiaries'
    })
  }
})