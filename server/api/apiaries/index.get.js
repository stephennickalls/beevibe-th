// server/api/apiaries/index.get.js - Get all apiaries for user
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    
    if (!supabaseUrl || !anonKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Authenticate user
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
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get apiaries with hive count
    const { data: apiaries, error } = await authClient
      .from('apiaries')
      .select(`
        *,
        hives:hives(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching apiaries:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch apiaries'
      })
    }

    // Transform the data to include hive count
    const apiariesWithCount = apiaries.map(apiary => ({
      ...apiary,
      hive_count: apiary.hives?.[0]?.count || 0
    }))

    return {
      data: apiariesWithCount,
      count: apiariesWithCount.length
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

// ============================================================================





