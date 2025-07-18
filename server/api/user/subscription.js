// server/api/user/subscription.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    if (getMethod(event) !== 'GET') {
      return { error: 'Method not allowed' }
    }

    // Get the authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return { error: 'No authentication token provided' }
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { error: 'Invalid authentication token' }
    }

    const userId = user.id

    // Get user subscription with plan details
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          description,
          price,
          billing_cycle,
          features,
          limits
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // No subscription found
      if (error.code === 'PGRST116') {
        return { data: null }
      }
      throw error
    }

    // Format the response
    const formattedData = {
      ...data,
      plan_name: data.subscription_plans?.name || 'Unknown Plan',
      plan_description: data.subscription_plans?.description,
      plan_price: data.subscription_plans?.price,
      plan_features: data.subscription_plans?.features,
      plan_limits: data.subscription_plans?.limits
    }

    return { data: formattedData }
    
  } catch (error) {
    console.error('Subscription API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})