// server/api/hives/[id].delete.js - Delete a hive
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== DELETE HIVE START ===')
    
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

    // Step 1: Authenticate user
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

    // Step 2: Get hive ID from route params
    const hiveId = getRouterParam(event, 'id')
    if (!hiveId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hive ID is required'
      })
    }

    console.log('Deleting hive:', hiveId, 'for user:', user.id)

    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Step 3: Verify hive exists and belongs to user
    const { data: existingHive, error: fetchError } = await serviceClient
      .from('hives')
      .select('id, user_id, name')
      .eq('id', hiveId)
      .single()

    if (fetchError || !existingHive) {
      console.error('Hive fetch error:', fetchError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Hive not found'
      })
    }

    if (existingHive.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own hives'
      })
    }

    // Step 4: Handle related data
    console.log('Handling related data cleanup...')

    // First, unlink all sensors from this hive (don't delete them, just unlink)
    const { error: unlinkError } = await serviceClient
      .from('sensors')
      .update({ hive_id: null, updated_at: new Date().toISOString() })
      .eq('hive_id', hiveId)

    if (unlinkError) {
      console.error('Error unlinking sensors:', unlinkError)
      // Don't fail the deletion for this, just log it
    } else {
      console.log('Successfully unlinked sensors from hive')
    }

    // Delete related alerts
    const { error: alertsError } = await serviceClient
      .from('alerts')
      .delete()
      .eq('hive_id', hiveId)

    if (alertsError) {
      console.error('Error deleting alerts:', alertsError)
      // Don't fail the deletion for this, just log it
    } else {
      console.log('Successfully deleted related alerts')
    }

    // Delete related sensor readings
    const { error: readingsError } = await serviceClient
      .from('sensor_readings')
      .delete()
      .eq('hive_id', hiveId)

    if (readingsError) {
      console.error('Error deleting sensor readings:', readingsError)
      // Don't fail the deletion for this, just log it
    } else {
      console.log('Successfully deleted related sensor readings')
    }

    // Delete related daily summaries
    const { error: summariesError } = await serviceClient
      .from('daily_summaries')
      .delete()
      .eq('hive_id', hiveId)

    if (summariesError) {
      console.error('Error deleting daily summaries:', summariesError)
      // Don't fail the deletion for this, just log it
    } else {
      console.log('Successfully deleted related daily summaries')
    }

    // Delete related queen status records
    const { error: queenError } = await serviceClient
      .from('queen_status')
      .delete()
      .eq('hive_id', hiveId)

    if (queenError) {
      console.error('Error deleting queen status:', queenError)
      // Don't fail the deletion for this, just log it
    } else {
      console.log('Successfully deleted related queen status')
    }

    // Step 5: Delete the hive itself
    const { error: deleteError } = await serviceClient
      .from('hives')
      .delete()
      .eq('id', hiveId)
      .eq('user_id', user.id) // Double-check ownership

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete hive: ${deleteError.message}`
      })
    }

    console.log('✅ Hive deleted successfully')
    console.log('=== DELETE HIVE END ===')
    
    return { 
      success: true,
      message: 'Hive deleted successfully'
    }
    
  } catch (error) {
    console.error('Delete hive error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete hive'
    })
  }
})