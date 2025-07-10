// server/api/daily-summaries/[hiveId].get.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl, 
    config.public.supabaseAnonKey
  )
  const hiveId = getRouterParam(event, 'hiveId')
  const query = getQuery(event)
  
  const { days = 30 } = query
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  try {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('hive_id', hiveId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
    
    if (error) throw error
    
    return { data }
  } catch (error) {
    return { error: error.message }
  }
})