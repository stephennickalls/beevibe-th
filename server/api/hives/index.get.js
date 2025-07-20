// server/api/hives/index.get.js - Enhanced with latest sensor readings
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Get runtime configuration
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    const serviceRoleKey = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Supabase configuration'
      })
    }

    // Step 1: Extract and validate authentication token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization header required'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Valid token required'
      })
    }

    // Step 2: Authenticate user with anon client
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    console.log(`Fetching enhanced hives data for user: ${user.id}`)

    // Step 3: Query database with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Get hives with sensors
    const { data: hives, error: queryError } = await serviceClient
      .from('hives')
      .select(`
        id,
        uuid,
        name,
        description,
        latitude,
        longitude,
        installation_date,
        is_active,
        created_at,
        updated_at,
        user_id,
        created_by,
        sensors (
          id,
          sensor_type,
          name,
          is_online,
          last_reading_at,
          battery_level,
          model
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Database query error:', queryError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch hives from database'
      })
    }

    // Step 4: Get latest readings for each sensor
    const hivesWithReadings = await Promise.all(
      (hives || []).map(async (hive) => {
        const sensors = hive.sensors || []
        
        // Get latest readings for all sensors in this hive
        const sensorsWithReadings = await Promise.all(
          sensors.map(async (sensor) => {
            // Get the latest reading for this sensor
            const { data: latestReading } = await serviceClient
              .from('sensor_readings')
              .select('value, unit, reading_time, signal_strength')
              .eq('sensor_id', sensor.id)
              .eq('hive_id', hive.id)
              .order('reading_time', { ascending: false })
              .limit(1)
              .maybeSingle()

            return {
              ...sensor,
              latest_reading: latestReading ? {
                value: latestReading.value,
                unit: latestReading.unit,
                reading_time: latestReading.reading_time,
                signal_strength: latestReading.signal_strength
              } : null
            }
          })
        )

        // Calculate hive-level metrics from latest readings
        const tempSensor = sensorsWithReadings.find(s => s.sensor_type === 'temperature')
        const humiditySensor = sensorsWithReadings.find(s => s.sensor_type === 'humidity')
        const weightSensor = sensorsWithReadings.find(s => s.sensor_type === 'weight')

        // Calculate sensor metrics
        const onlineSensors = sensorsWithReadings.filter(s => s.is_online)
        const lastReading = sensorsWithReadings.reduce((latest, sensor) => {
          if (!sensor.latest_reading?.reading_time) return latest
          if (!latest) return sensor.latest_reading.reading_time
          return new Date(sensor.latest_reading.reading_time) > new Date(latest) 
            ? sensor.latest_reading.reading_time 
            : latest
        }, null)

        return {
          ...hive,
          sensors: sensorsWithReadings,
          sensor_count: sensorsWithReadings.length,
          online_sensor_count: onlineSensors.length,
          last_sensor_reading: lastReading,
          // Current readings for dashboard display
          temperature: tempSensor?.latest_reading?.value || null,
          temperature_time: tempSensor?.latest_reading?.reading_time || null,
          humidity: humiditySensor?.latest_reading?.value || null,
          humidity_time: humiditySensor?.latest_reading?.reading_time || null,
          weight: weightSensor?.latest_reading?.value || null,
          weight_time: weightSensor?.latest_reading?.reading_time || null
        }
      })
    )

    console.log(`Successfully fetched ${hivesWithReadings.length} hives with sensor readings for user ${user.id}`)

    // Step 5: Return formatted response
    return {
      success: true,
      data: hivesWithReadings,
      count: hivesWithReadings.length,
      user_id: user.id
    }

  } catch (error) {
    console.error('Enhanced hives API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching hives'
    })
  }
})