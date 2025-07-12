// server/api/alerts/[id]/resolve.put.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  const alertId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    const updateData = {
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: body.resolved_by || 'System',
      resolved_notes: body.resolved_notes || null
    }
    
    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', parseInt(alertId))
      .select()
      .single()
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})