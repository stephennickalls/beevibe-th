// server/api/sensors/[id].delete.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const sensorId = getRouterParam(event, 'id')

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    console.log('Attempting to delete sensor with ID:', sensorId)
    
    // Check if sensor exists first
    const { data: existingSensor, error: checkError } = await supabase
      .from('sensors')
      .select('id, name, sensor_type')
      .eq('id', parseInt(sensorId))
      .single()

    if (checkError) {
      console.error('Error checking sensor existence:', checkError)
      if (checkError.code === 'PGRST116') {
        return { error: 'Sensor not found' }
      }
      throw checkError
    }

    console.log('Found sensor to delete:', existingSensor)

    // Delete related sensor readings first (cascade delete)
    const { error: readingsError } = await supabase
      .from('sensor_readings')
      .delete()
      .eq('sensor_id', parseInt(sensorId))

    if (readingsError) {
      console.error('Error deleting sensor readings:', readingsError)
      // Don't throw here - continue with sensor deletion even if readings fail
    } else {
      console.log('Successfully deleted sensor readings')
    }

    // Delete the sensor
    const { error: sensorError } = await supabase
      .from('sensors')
      .delete()
      .eq('id', parseInt(sensorId))

    if (sensorError) {
      console.error('Error deleting sensor:', sensorError)
      throw sensorError
    }

    console.log('Successfully deleted sensor')
    
    return { data: { success: true, deletedSensor: existingSensor } }
  } catch (error) {
    console.error('Error in sensor delete endpoint:', error)
    return { error: error.message }
  }
})