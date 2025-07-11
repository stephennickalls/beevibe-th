// server/api/hives/[id].put.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const hiveId = getRouterParam(event, 'id')

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return { error: 'Hive name is required' }
    }

    // Determine if the ID is a UUID or integer
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hiveId)

    // Prepare update data
    const updateData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      installation_date: body.installation_date || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    }

    // Build query based on ID type
    let query = supabase.from('hives').update(updateData)
    
    if (isUUID) {
      query = query.eq('uuid', hiveId)
    } else {
      query = query.eq('id', parseInt(hiveId))
    }

    // Update the hive
    const { data, error } = await query.select().single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { error: 'Hive not found' }
      }
      throw error
    }
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})