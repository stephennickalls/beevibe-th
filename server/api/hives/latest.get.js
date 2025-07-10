// server/api/hives/latest.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    // First, get all hives
    const { data: hives, error: hivesError } = await supabase
      .from('hives')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (hivesError) throw hivesError
    
    // For each hive, get the latest sensor readings
    const hivesWithSensorData = await Promise.all(
      hives.map(async (hive) => {
        // Get latest temperature
        const { data: tempData } = await supabase
          .from('sensor_readings')
          .select('value, reading_time')
          .eq('hive_id', hive.id)
          .eq('sensor_type', 'temperature')
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get latest humidity
        const { data: humidityData } = await supabase
          .from('sensor_readings')
          .select('value, reading_time')
          .eq('hive_id', hive.id)
          .eq('sensor_type', 'humidity')
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get latest weight
        const { data: weightData } = await supabase
          .from('sensor_readings')
          .select('value, reading_time')
          .eq('hive_id', hive.id)
          .eq('sensor_type', 'weight')
          .order('reading_time', { ascending: false })
          .limit(1)
          .maybeSingle()

        return {
          ...hive,
          temperature: tempData?.value || null,
          temperature_time: tempData?.reading_time || null,
          humidity: humidityData?.value || null,
          humidity_time: humidityData?.reading_time || null,
          weight: weightData?.value || null,
          weight_time: weightData?.reading_time || null
        }
      })
    )
    
    return { data: hivesWithSensorData }
    
  } catch (error) {
    return { error: error.message }
  }
})