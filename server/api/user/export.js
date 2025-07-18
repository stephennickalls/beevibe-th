// server/api/user/export.js
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

    // Export user data
    const exportData = {
      export_date: new Date().toISOString(),
      user_id: userId,
      user_email: user.email
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profileError) {
      exportData.profile = profile
    }

    // Get user hives
    const { data: hives, error: hivesError } = await supabase
      .from('hives')
      .select('*')
      .eq('user_id', userId)

    if (!hivesError) {
      exportData.hives = hives
    }

    // Get user sensors
    const { data: sensors, error: sensorsError } = await supabase
      .from('sensors')
      .select('*')
      .eq('user_id', userId)

    if (!sensorsError) {
      exportData.sensors = sensors
    }

    // Get user alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)

    if (!alertsError) {
      exportData.alerts = alerts
    }

    // Get user subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (!subscriptionError) {
      exportData.subscription = subscription
    }

    // Get user payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)

    if (!paymentsError) {
      exportData.payments = payments
    }

    return { data: exportData }
    
  } catch (error) {
    console.error('Export API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})