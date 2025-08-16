// server/api/sensor-nodes/index.get.js
// GET /api/sensor-nodes - List sensor nodes with optional filtering

import { createClient } from '@supabase/supabase-js'

const serviceClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const query = getQuery(event)
    const { apiary_id, hive_id } = query

    // Build the query
    let supabaseQuery = serviceClient
      .from('sensor_nodes')
      .select(`
        *,
        hive:hives!sensor_nodes_hive_id_fkey(
          id,
          name,
          apiary_id,
          apiary:apiaries!hives_apiary_id_fkey(id, name)
        ),
        hub:apiary_hubs!sensor_nodes_hub_id_fkey(
          id,
          name,
          last_seen
        ),
        sensors(
          id,
          name,
          sensor_type,
          is_online,
          battery_level,
          last_reading_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (apiary_id) {
      // Filter by apiary through the hive relationship
      supabaseQuery = supabaseQuery.eq('hive.apiary_id', apiary_id)
    }

    if (hive_id) {
      supabaseQuery = supabaseQuery.eq('hive_id', hive_id)
    }

    const { data: sensorNodes, error } = await supabaseQuery

    if (error) {
      console.error('Error fetching sensor nodes:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch sensor nodes'
      })
    }

    // Transform data to include derived properties
    const transformedData = sensorNodes.map(node => ({
      ...node,
      // Calculate battery level from sensors (average or lowest)
      battery_level: node.sensors?.length > 0 
        ? Math.min(...node.sensors.map(s => s.battery_level || 100))
        : node.battery_level || 100,
      // Determine online status
      is_online: node.last_seen 
        ? (new Date() - new Date(node.last_seen)) < (10 * 60 * 1000) // 10 minutes
        : false,
      // Calculate RSSI/signal strength (mock for now)
      rssi: node.last_seen ? -50 + Math.floor(Math.random() * 30) : null
    }))

    return {
      success: true,
      data: transformedData,
      count: transformedData.length
    }

  } catch (err) {
    console.error('Sensor nodes API error:', err)
    
    if (err.statusCode) {
      throw err
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

