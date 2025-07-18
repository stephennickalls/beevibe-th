// server/api/user/stats.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    if (getMethod(event) !== 'GET') {
      return { error: 'Method not allowed' }
    }

    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return { error: 'No authentication token provided' }
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { error: 'Invalid authentication token' }
    }

    const userId = user.id

    // Get total hives count
    const { count: hivesCount, error: hivesError } = await supabase
      .from('hives')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (hivesError) throw hivesError

    // Get total sensors count
    const { count: sensorsCount, error: sensorsError } = await supabase
      .from('sensors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (sensorsError) throw sensorsError

    // Get total alerts count
    const { count: alertsCount, error: alertsError } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (alertsError) throw alertsError

    return {
      data: {
        total_hives: hivesCount || 0,
        total_sensors: sensorsCount || 0,
        total_alerts: alertsCount || 0
      }
    }
    
  } catch (error) {
    console.error('Stats API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})