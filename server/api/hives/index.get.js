// server/api/hives/index.get.js
import { createClient } from '@supabase/supabase-js'


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  
  try {
    const { data, error } = await supabase
      .from('hives')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})