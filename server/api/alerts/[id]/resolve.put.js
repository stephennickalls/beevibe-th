// server/api/alerts/[id]/resolve.put.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  const alertId = getRouterParam(event, 'id')
  
  if (!alertId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alert ID is required'
    })
  }
  
  try {
    const body = await readBody(event)
    
    console.log('Resolving alert ID:', alertId, 'with body:', body)
    
    const updateData = {
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: body.resolved_by || 'User',
      resolved_notes: body.resolved_notes || null
    }
    
    // First check if alert exists
    const { data: existingAlert, error: checkError } = await supabase
      .from('alerts')
      .select('id, resolved')
      .eq('id', parseInt(alertId))
      .single()
    
    if (checkError) {
      console.error('Error checking alert existence:', checkError)
      if (checkError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Alert not found'
        })
      }
      throw checkError
    }
    
    if (existingAlert.resolved) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Alert is already resolved'
      })
    }
    
    // Update the alert
    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', parseInt(alertId))
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating alert:', error)
      throw error
    }
    
    console.log('Successfully resolved alert:', data)
    
    return { data, success: true }
  } catch (error) {
    console.error('Error in alert resolve endpoint:', error)
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error
    }
    
    // Otherwise, create a generic server error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resolve alert: ' + error.message
    })
  }
})