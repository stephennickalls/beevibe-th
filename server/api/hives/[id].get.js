// server/api/hives/[id].get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const hiveId = getRouterParam(event, 'id')

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    // Determine if the ID is a UUID or integer
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hiveId)
    
    // Build query based on ID type
    let query = supabase.from('hives').select('*')
    
    if (isUUID) {
      query = query.eq('uuid', hiveId)
    } else {
      query = query.eq('id', parseInt(hiveId))
    }
    
    // Get hive details
    const { data: hive, error: hiveError } = await query.single()
    
    if (hiveError) {
      if (hiveError.code === 'PGRST116') {
        return { error: 'Hive not found' }
      }
      throw hiveError
    }

    // Get latest sensor readings for this hive
    const { data: tempData } = await supabase
      .from('sensor_readings')
      .select('value, reading_time')
      .eq('hive_id', hive.id)
      .eq('sensor_type', 'temperature')
      .order('reading_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: humidityData } = await supabase
      .from('sensor_readings')
      .select('value, reading_time')
      .eq('hive_id', hive.id)
      .eq('sensor_type', 'humidity')
      .order('reading_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: weightData } = await supabase
      .from('sensor_readings')
      .select('value, reading_time')
      .eq('hive_id', hive.id)
      .eq('sensor_type', 'weight')
      .order('reading_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Combine hive data with sensor readings
    const hiveWithSensorData = {
      ...hive,
      temperature: tempData?.value || null,
      temperature_time: tempData?.reading_time || null,
      humidity: humidityData?.value || null,
      humidity_time: humidityData?.reading_time || null,
      weight: weightData?.value || null,
      weight_time: weightData?.reading_time || null
    }
    
    return { data: hiveWithSensorData }
  } catch (error) {
    return { error: error.message }
  }
})