// server/api/alerts/index.get.js - Updated with proper authentication and user filtering
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

    // Step 1: Authenticate user
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Valid token required'
      })
    }

    // Verify user with anon client
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`Fetching alerts for user: ${user.id}`)

    // Step 2: Get query parameters
    const query = getQuery(event)
    const { 
      status = 'active',  // 'active', 'resolved', 'all'
      severity,           // 'critical', 'warning', 'info'
      hive_id,           // specific hive filter
      limit = 50 
    } = query

    // Step 3: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    let dbQuery = serviceClient
      .from('alerts')
      .select(`
        id,
        hive_id,
        alert_type,
        severity,
        title,
        message,
        threshold_value,
        actual_value,
        sensor_id,
        resolved,
        resolved_by,
        resolved_notes,
        created_at,
        resolved_at,
        hives!alerts_hive_id_fkey(
          id,
          name,
          user_id
        ),
        sensors!alerts_sensor_id_fkey(
          id,
          name,
          sensor_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    // Filter by user's hives only
    dbQuery = dbQuery.eq('hives.user_id', user.id)

    // Filter by status
    if (status === 'active') {
      dbQuery = dbQuery.eq('resolved', false)
    } else if (status === 'resolved') {
      dbQuery = dbQuery.eq('resolved', true)
    }
    // status === 'all' returns both

    // Filter by severity if specified
    if (severity) {
      dbQuery = dbQuery.eq('severity', severity)
    }

    // Filter by specific hive if specified
    if (hive_id) {
      dbQuery = dbQuery.eq('hive_id', parseInt(hive_id))
    }

    const { data: alerts, error: queryError } = await dbQuery

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch alerts from database'
      })
    }

    // Step 4: Process and enrich alert data
    const processedAlerts = (alerts || []).map(alert => ({
      ...alert,
      hive_name: alert.hives?.name || `Hive ${alert.hive_id}`,
      sensor_name: alert.sensors?.name || `${alert.sensors?.sensor_type || 'Unknown'} Sensor`
    }))

    console.log(`Successfully fetched ${processedAlerts.length} alerts for user ${user.id}`)

    return {
      success: true,
      data: processedAlerts,
      count: processedAlerts.length,
      filters: {
        status,
        severity,
        hive_id
      }
    }

  } catch (error) {
    console.error('Alerts API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching alerts'
    })
  }
})



