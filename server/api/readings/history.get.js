// server/api/readings/history.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  const query = getQuery(event)
  
  const { hive_id, sensor_type, time_range = '24h' } = query
  
  // Calculate date range based on time_range
  const now = new Date()
  let startDate
  
  switch(time_range) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }
  
  try {
    let query = supabase
      .from('sensor_readings')
      .select('*')
      .gte('reading_time', startDate.toISOString())
      .order('reading_time', { ascending: true })
    
    if (hive_id) {
      query = query.eq('hive_id', hive_id)
    }
    
    if (sensor_type) {
      query = query.eq('sensor_type', sensor_type)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})