// server/api/alerts/[id]/resolve.put.js - Fixed with better error handling and debugging
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== RESOLVE ALERT START ===')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Config check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!anonKey,
      hasServiceKey: !!serviceRoleKey
    })
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Get alert ID from route
    const alertId = getRouterParam(event, 'id')
    console.log('Alert ID:', alertId)
    
    if (!alertId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Alert ID is required'
      })
    }

    // Step 1: Authenticate user
    const authHeader = getHeader(event, 'authorization')
    console.log('Auth header exists:', !!authHeader)
    
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

    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Step 2: Get request body
    const body = await readBody(event)
    console.log('Request body:', body)

    // Step 3: Create service client and verify alert ownership
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    console.log('Checking alert ownership...')
    
    // First, let's check if the alert exists at all
    const { data: alertCheck, error: alertCheckError } = await serviceClient
      .from('alerts')
      .select('id, resolved, hive_id')
      .eq('id', parseInt(alertId))
      .single()

    console.log('Alert check result:', {
      alert: alertCheck,
      error: alertCheckError?.message
    })

    if (alertCheckError) {
      if (alertCheckError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Alert not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: `Database error: ${alertCheckError.message}`
      })
    }

    // Now check if the hive belongs to the user
    const { data: hiveCheck, error: hiveCheckError } = await serviceClient
      .from('hives')
      .select('id, user_id')
      .eq('id', alertCheck.hive_id)
      .single()

    console.log('Hive ownership check:', {
      hive: hiveCheck,
      userMatches: hiveCheck?.user_id === user.id,
      error: hiveCheckError?.message
    })

    if (hiveCheckError || !hiveCheck) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify alert ownership'
      })
    }

    // Verify the alert belongs to the authenticated user
    if (hiveCheck.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied to this alert'
      })
    }

    if (alertCheck.resolved) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Alert is already resolved'
      })
    }

    // Step 4: Update the alert
    console.log('Updating alert...')
    
    const updateData = {
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user.email || user.id,
      resolved_notes: body.resolved_notes || null
    }

    console.log('Update data:', updateData)

    const { data: updatedAlert, error: updateError } = await serviceClient
      .from('alerts')
      .update(updateData)
      .eq('id', parseInt(alertId))
      .select()
      .single()

    console.log('Update result:', {
      success: !!updatedAlert,
      error: updateError?.message
    })

    if (updateError) {
      console.error('Update error details:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update alert: ${updateError.message}`
      })
    }

    // Step 5: Get enriched data for response
    console.log('Getting enriched alert data...')
    
    const { data: enrichedAlert, error: enrichError } = await serviceClient
      .from('alerts')
      .select(`
        *,
        hives!alerts_hive_id_fkey(name),
        sensors!alerts_sensor_id_fkey(name, sensor_type)
      `)
      .eq('id', parseInt(alertId))
      .single()

    if (enrichError) {
      console.warn('Could not get enriched data, using basic update result')
      // Use the basic update result if enriched query fails
    }

    const finalAlert = enrichedAlert || updatedAlert
    const responseData = {
      ...finalAlert,
      hive_name: finalAlert.hives?.name || `Hive ${finalAlert.hive_id}`,
      sensor_name: finalAlert.sensors?.name || `${finalAlert.sensors?.sensor_type || 'Unknown'} Sensor`
    }

    console.log(`✅ Alert ${alertId} resolved successfully by user ${user.id}`)
    console.log('=== RESOLVE ALERT END ===')

    return {
      success: true,
      data: responseData
    }

  } catch (error) {
    console.error('❌ Resolve alert error:', error)
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      statusMessage: error.statusMessage
    })
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: `Internal server error: ${error.message}`
    })
  }
})