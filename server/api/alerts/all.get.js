// server/api/alerts/all.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  const query = getQuery(event)
  const { status = 'all', limit = 100, hive_id } = query
  
  try {
    let dbQuery = supabase
      .from('alerts')
      .select(`
        *,
        hives!alerts_hive_id_fkey(name),
        sensors!alerts_sensor_id_fkey(name, sensor_type)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))
    
    // Filter by status
    if (status === 'active') {
      dbQuery = dbQuery.eq('resolved', false)
    } else if (status === 'resolved') {
      dbQuery = dbQuery.eq('resolved', true)
    }
    // status === 'all' returns both
    
    // Filter by hive if specified
    if (hive_id) {
      dbQuery = dbQuery.eq('hive_id', parseInt(hive_id))
    }
    
    const { data, error } = await dbQuery
    
    if (error) throw error
    
    // Enhance data with hive names
    const enhancedData = data.map(alert => ({
      ...alert,
      hive_name: alert.hives?.name || `Hive ${alert.hive_id}`,
      sensor_name: alert.sensors?.name || `${alert.sensors?.sensor_type || 'Unknown'} Sensor`
    }))
    
    return { data: enhancedData }
  } catch (error) {
    return { error: error.message }
  }
})