// server/api/sensors/index.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    let sensorsQuery = supabase
      .from('sensors')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by hive_id if provided
    if (query.hive_id) {
      // Handle both UUID and integer hive IDs
      const hiveId = query.hive_id
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hiveId)
      
      if (isUUID) {
        // If UUID, we need to first get the hive's integer ID
        const { data: hive } = await supabase
          .from('hives')
          .select('id')
          .eq('uuid', hiveId)
          .single()
        
        if (hive) {
          sensorsQuery = sensorsQuery.eq('hive_id', hive.id)
        } else {
          // If hive not found, return empty array
          return { data: [] }
        }
      } else {
        // If integer ID, use directly
        sensorsQuery = sensorsQuery.eq('hive_id', parseInt(hiveId))
      }
    }
    
    const { data, error } = await sensorsQuery
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})