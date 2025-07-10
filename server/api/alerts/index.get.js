
// server/api/alerts/index.get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})