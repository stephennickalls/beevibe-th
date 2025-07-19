// server/api/hives-debug.get.js - Updated to use service role for database queries
export default defineEventHandler(async (event) => {
  try {
    console.log('=== HIVES DEBUG START ===')
    
    // Step 1: Check config
    console.log('Step 1: Getting config...')
    const config = useRuntimeConfig()
    console.log('Config public:', !!config.public)
    console.log('Supabase URL exists:', !!config.public?.supabaseUrl)
    console.log('Supabase Key exists:', !!(config.supabaseAnonKey || config.public?.supabaseAnonKey))
    
    const supabaseUrl = config.public?.supabaseUrl
    const anonKey = config.supabaseAnonKey || config.public?.supabaseAnonKey
    
    if (!supabaseUrl || !anonKey) {
      console.log('❌ Missing Supabase config')
      return { error: 'Missing Supabase configuration', supabaseUrl: !!supabaseUrl, supabaseKey: !!anonKey }
    }
    
    // Step 2: Check auth header
    console.log('Step 2: Checking auth header...')
    const authHeader = getHeader(event, 'authorization')
    console.log('Auth header exists:', !!authHeader)
    
    if (!authHeader) {
      console.log('❌ No auth header')
      return { error: 'No authorization header' }
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extracted:', !!token)
    
    if (!token) {
      console.log('❌ No token')
      return { error: 'No token provided' }
    }

    // Step 3: Authenticate user with anon key
    console.log('Step 3: Authenticating user...')
    const { createClient } = await import('@supabase/supabase-js')
    const authClient = createClient(supabaseUrl, anonKey)
    
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)
    console.log('Auth error:', authError?.message || 'none')
    console.log('User found:', !!user)
    console.log('User ID:', user?.id || 'none')
    
    if (authError || !user) {
      console.log('❌ Auth failed')
      return { error: 'Authentication failed', authError: authError?.message }
    }

    // Step 4: Use service role for database queries (bypasses RLS)
    console.log('Step 4: Creating service role client...')
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI1NTY1MCwiZXhwIjoyMDUyODMxNjUwfQ.VVEw8Bob9AjV_WeBsVHLdNKMRUWq2QLeBHAG8o1is7s'
    
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)
    console.log('✅ Service role client created')

    // Step 5: Query database with service role (bypasses RLS)
    console.log('Step 5: Testing database query with service role...')
    const { data: hives, error: dbError } = await serviceClient
      .from('hives')
      .select('id, name, user_id')
      .eq('user_id', user.id)
      .eq('is_active', true)

    console.log('DB error:', dbError?.message || 'none')
    console.log('Hives found:', hives?.length || 0)
    
    if (dbError) {
      console.log('❌ Database error')
      return { error: 'Database error', dbError: dbError.message }
    }

    console.log('✅ SUCCESS - Found hives:', hives)
    console.log('=== HIVES DEBUG END ===')

    return { 
      success: true,
      data: hives,
      user_id: user.id,
      count: hives?.length || 0,
      method: 'service_role'
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error)
    return { 
      error: 'Critical error',
      message: error.message,
      stack: error.stack
    }
  }
})