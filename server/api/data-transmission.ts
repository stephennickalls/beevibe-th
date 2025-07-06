import { defineEventHandler, readBody, createError, setResponseStatus } from 'h3'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.supabaseUrl!
const supabaseKey = process.env.supabaseKey!
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { hiveUuid, readings } = body

    if (!hiveUuid || !Array.isArray(readings)) {
      setResponseStatus(event, 400)
      return { message: 'Missing hiveUuid or readings array.' }
    }

    // ✅ Check if hive exists
    const { data: hive, error: hiveError } = await supabase
      .from('hives')
      .select('id')
      .eq('uuid', hiveUuid)
      .single()

    if (hiveError || !hive) {
      setResponseStatus(event, 401)
      return { message: 'Invalid hive UUID.' }
    }

    const hiveId = hive.id
    const insertData = []

    for (const [index, reading] of readings.entries()) {
      const { sensorUuid, timestamp, value } = reading

      if (!sensorUuid || !timestamp || value == null) {
        setResponseStatus(event, 400)
        return { message: `Invalid reading at index ${index}: missing sensorUuid, timestamp, or value.` }
      }

      const { data: sensor, error: sensorError } = await supabase
        .from('sensor')
        .select('uuid, hive_id')
        .eq('uuid', sensorUuid)
        .single()

      if (sensorError || !sensor) {
        setResponseStatus(event, 401)
        return { message: `Sensor with UUID ${sensorUuid} not found.` }
      }

      if (sensor.hive_id !== hiveId) {
        setResponseStatus(event, 401)
        return { message: `Sensor ${sensorUuid} is not linked to hive ${hiveUuid}.` }
      }


      insertData.push({
        sensor_uuid: sensorUuid,
        timestamp,
        value
      })
    }

    if (insertData.length === 0) {
      setResponseStatus(event, 400)
      return { message: 'No valid sensor readings to insert.' }
    }

    const { error: insertError } = await supabase
      .from('sensor_data')
      .insert(insertData)

    if (insertError) {
      throw insertError
    }

    return { message: 'Sensor data inserted successfully.', count: insertData.length }
  } catch (err) {
    console.error('Data transmission error:', err)
    setResponseStatus(event, 500)
    return { message: 'Server error during data transmission.' }
  }
})
