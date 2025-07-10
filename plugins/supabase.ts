// plugins/supabase.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const supabaseDB = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string  // ← Change this line
  )

  return {
    provide: {
      supabaseDB
    }
  }
})
