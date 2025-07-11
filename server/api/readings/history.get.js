// server/api/readings/history.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  const urlQuery = getQuery(event)
  
  const { hive_id, sensor_type, time_range = '24h' } = urlQuery
  
  console.log('History API called with:', { hive_id, sensor_type, time_range })
  
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
  
  console.log('Date range:', { startDate: startDate.toISOString(), endDate: now.toISOString() })
  
  try {
    let dbQuery = supabase
      .from('sensor_readings')
      .select('*')
      .gte('reading_time', startDate.toISOString())
      .lte('reading_time', now.toISOString())
      .order('reading_time', { ascending: true })
    
    if (hive_id) {
      dbQuery = dbQuery.eq('hive_id', parseInt(hive_id))
    }
    
    if (sensor_type) {
      dbQuery = dbQuery.eq('sensor_type', sensor_type)
    }
    
    const { data, error } = await dbQuery
    
    if (error) {
      console.error('Database error:', error)
      throw error
    }
    
    console.log(`Found ${data ? data.length : 0} sensor readings`)
    if (data && data.length > 0) {
      console.log('Sample reading:', data[0])
    }
    
    return { data: data || [] }
  } catch (error) {
    console.error('API Error:', error)
    return { error: error.message }
  }
})