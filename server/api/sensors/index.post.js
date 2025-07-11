// server/api/sensors/index.post.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.hive_id || !body.sensor_type) {
      return { error: 'Hive ID and sensor type are required' }
    }

    // Validate sensor type
    const validTypes = ['temperature', 'humidity', 'weight']
    if (!validTypes.includes(body.sensor_type)) {
      return { error: 'Invalid sensor type. Must be: temperature, humidity, or weight' }
    }

    // Determine if the hive_id is a UUID or integer and get the integer ID
    const hiveId = body.hive_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hiveId)
    
    let hiveIntId
    
    if (isUUID) {
      // If UUID, look up the integer ID
      const { data: hive, error: hiveError } = await supabase
        .from('hives')
        .select('id')
        .eq('uuid', hiveId)
        .single()
      
      if (hiveError || !hive) {
        return { error: 'Hive not found' }
      }
      
      hiveIntId = hive.id
    } else {
      // If integer, validate it exists
      const { data: hive, error: hiveError } = await supabase
        .from('hives')
        .select('id')
        .eq('id', parseInt(hiveId))
        .single()
      
      if (hiveError || !hive) {
        return { error: 'Hive not found' }
      }
      
      hiveIntId = parseInt(hiveId)
    }

    // Generate a simple UUID for the sensor
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    // Create sensor object
    const newSensor = {
      uuid: generateUUID(),
      hive_id: hiveIntId, // Use the resolved integer ID
      sensor_type: body.sensor_type,
      name: body.name?.trim() || `${body.sensor_type} Sensor`,
      model: body.model?.trim() || null,
      battery_level: body.battery_level || 100,
      is_online: body.is_online !== undefined ? body.is_online : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert sensor into database
    const { data, error } = await supabase
      .from('sensors')
      .insert([newSensor])
      .select()
      .single()

    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})