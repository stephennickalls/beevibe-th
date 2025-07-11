// server/api/sensors/[id].put.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const sensorId = getRouterParam(event, 'id')

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const body = await readBody(event)
    
    // Validate required fields - name is optional, we'll use default if empty
    console.log('Updating sensor with ID:', sensorId, 'Body:', body)

    // Check if sensor exists first
    const { data: existingSensor, error: checkError } = await supabase
      .from('sensors')
      .select('id, sensor_type')
      .eq('id', parseInt(sensorId))
      .single()

    if (checkError) {
      console.error('Error checking sensor existence:', checkError)
      if (checkError.code === 'PGRST116') {
        return { error: 'Sensor not found' }
      }
      throw checkError
    }

    // Prepare update data
    const updateData = {
      name: body.name?.trim() || `${existingSensor.sensor_type} Sensor`,
      model: body.model?.trim() || null,
      battery_level: body.battery_level !== undefined ? parseInt(body.battery_level) : null,
      is_online: body.is_online !== undefined ? body.is_online : true,
      updated_at: new Date().toISOString()
    }

    console.log('Update data:', updateData)

    // Update the sensor
    const { data, error } = await supabase
      .from('sensors')
      .update(updateData)
      .eq('id', parseInt(sensorId))
      .select()
      .single()

    if (error) {
      console.error('Error updating sensor:', error)
      throw error
    }

    console.log('Successfully updated sensor:', data)
    
    return { data }
  } catch (error) {
    console.error('Error in sensor update endpoint:', error)
    return { error: error.message }
  }
})