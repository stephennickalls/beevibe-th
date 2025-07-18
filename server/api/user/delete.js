// server/api/user/delete.js
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  // Use server-side config for API routes
  const supabase = createClient(
    config.supabaseUrl || config.public.supabaseUrl, 
    config.supabaseAnonKey || config.public.supabaseAnonKey
  )

  try {
    if (getMethod(event) !== 'DELETE') {
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
    const body = await readBody(event)
    
    if (body.confirmation !== 'DELETE') {
      return { error: 'Invalid confirmation. Please type DELETE to confirm account deletion.' }
    }

    // Start cleanup process
    try {
      // Delete user-related data in order (respecting foreign key constraints)
      
      // 1. Delete alerts
      await supabase
        .from('alerts')
        .delete()
        .eq('user_id', userId)

      // 2. Delete sensor readings (if table exists)
      try {
        await supabase
          .from('sensor_readings')
          .delete()
          .eq('user_id', userId)
      } catch (e) {
        console.log('No sensor_readings table or no data to delete')
      }

      // 3. Delete sensors
      await supabase
        .from('sensors')
        .delete()
        .eq('user_id', userId)

      // 4. Delete queen status records
      const { data: userHives } = await supabase
        .from('hives')
        .select('id')
        .eq('user_id', userId)

      if (userHives && userHives.length > 0) {
        const hiveIds = userHives.map(hive => hive.id)
        await supabase
          .from('queen_status')
          .delete()
          .in('hive_id', hiveIds)
      }

      // 5. Delete hives
      await supabase
        .from('hives')
        .delete()
        .eq('user_id', userId)

      // 6. Delete payments
      await supabase
        .from('payments')
        .delete()
        .eq('user_id', userId)

      // 7. Delete subscriptions
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', userId)

      // 8. Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      // 9. Note: We cannot delete the user from auth.users using the regular client
      // This would require service role permissions
      // For now, we'll just mark the account as deleted by cleaning up all related data
      
      return { data: { message: 'Account data deleted successfully. Please contact support to fully delete your account.' } }
      
    } catch (cleanupError) {
      console.error('Error during account cleanup:', cleanupError)
      return { error: 'Failed to delete account. Please contact support.' }
    }
    
  } catch (error) {
    console.error('Delete account API error:', error)
    return { error: error.message || 'Internal server error' }
  }
})