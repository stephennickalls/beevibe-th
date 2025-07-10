// server/api/queen-status/index.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const { data, error } = await supabase
      .from('queen_status')
      .select('*')
      .eq('status', 'active')
      .order('hive_id', { ascending: true })
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})