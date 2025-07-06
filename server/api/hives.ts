import { defineEventHandler, readBody, createError } from 'h3'
import { supabase } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const method = event.method

  // --- GET: return hives with latest sensor readings
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('hives')
      .select(`
        id,
        uuid,
        name,
        description,
        latitude,
        longitude,
        sensors (
          uuid,
          sensortype,
          sensor_readings (
            reading_time,
            temperature,
            humidity,
            weight
          )
        )
      `)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    const result = data.map((hive) => {
      const readings = {
        temperature: null,
        humidity: null,
        weight: null,
      }

      for (const sensor of hive.sensors || []) {
        const latestReading = sensor.sensor_readings?.[0]
        if (!latestReading) continue

        switch (sensor.sensortype) {
          case 'TEMPERATURE':
            readings.temperature = latestReading.temperature
            break
          case 'HUMIDITY':
            readings.humidity = latestReading.humidity
            break
          case 'WEIGHT':
            readings.weight = latestReading.weight
            break
        }
      }

      return {
        id: hive.id,
        uuid: hive.uuid,
        name: hive.name,
        description: hive.description,
        latitude: hive.latitude,
        longitude: hive.longitude,
        ...readings
      }
    })

    return result
  }

  // --- POST: create a new hive
  if (method === 'POST') {
    const body = await readBody(event)

    if (!body.name || body.latitude == null || body.longitude == null) {
      throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    const { data, error } = await supabase
      .from('hives')
      .insert({
        name: body.name,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description || ''
      })
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
