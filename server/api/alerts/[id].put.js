// server/api/alerts/[id].put.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )

  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update(body)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})