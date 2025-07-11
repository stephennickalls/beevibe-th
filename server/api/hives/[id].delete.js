// server/api/hives/[id].delete.js
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
    
    // First, get the hive to check if it exists and get the integer ID
    let query = supabase.from('hives').select('id')
    
    if (isUUID) {
      query = query.eq('uuid', hiveId)
    } else {
      query = query.eq('id', parseInt(hiveId))
    }
    
    const { data: existingHive, error: checkError } = await query.single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return { error: 'Hive not found' }
      }
      throw checkError
    }

    const hiveIntId = existingHive.id

    // Delete related sensor readings first (if you want to cascade)
    await supabase
      .from('sensor_readings')
      .delete()
      .eq('hive_id', hiveIntId)

    // Delete related sensors
    await supabase
      .from('sensors')
      .delete()
      .eq('hive_id', hiveIntId)

    // Delete related alerts
    await supabase
      .from('alerts')
      .delete()
      .eq('hive_id', hiveIntId)

    // Finally, delete the hive
    let deleteQuery = supabase.from('hives').delete()
    
    if (isUUID) {
      deleteQuery = deleteQuery.eq('uuid', hiveId)
    } else {
      deleteQuery = deleteQuery.eq('id', parseInt(hiveId))
    }

    const { error } = await deleteQuery

    if (error) throw error
    
    return { data: { success: true } }
  } catch (error) {
    return { error: error.message }
  }
})