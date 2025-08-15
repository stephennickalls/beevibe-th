// UPDATED server/utils/subscription-simple.js - Fixed for 1 sensor unit per hive
import { createClient } from '@supabase/supabase-js'

export const checkUserSubscriptionSimple = async (userId) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public?.supabaseUrl
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI1NTY1MCwiZXhwIjoyMDUyODMxNjUwfQ.VVEw8Bob9AjV_WeBsVHLdNKMRUWq2QLeBHAG8o1is7s'
    
    const client = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await client
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          display_name,
          features,
          limits
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return {
        hasActiveSubscription: false,
        plan: 'free',
        planDisplayName: 'Free',
        features: {},
        limits: { 
          max_hives: 1, 
          max_sensors_per_hive: 3, 
          max_sensors_total: 3,
          max_apiaries: 1,
          max_hubs: 1
          // max_sensor_units removed - it's 1:1 with hives
        }
      }
    }

    return {
      hasActiveSubscription: true,
      plan: data.subscription_plans.name,
      planDisplayName: data.subscription_plans.display_name,
      features: data.subscription_plans.features,
      limits: data.subscription_plans.limits,
      subscription: data
    }
  } catch (error) {
    console.error('Subscription check error:', error)
    return {
      hasActiveSubscription: false,
      plan: 'free',
      planDisplayName: 'Free',
      features: {},
      limits: { 
        max_hives: 1, 
        max_sensors_per_hive: 3, 
        max_sensors_total: 3,
        max_apiaries: 1,
        max_hubs: 1
      }
    }
  }
}

export const checkSubscriptionLimitsSimple = async (userId, action, data = {}) => {
  const subscriptionInfo = await checkUserSubscriptionSimple(userId)
  
  const config = useRuntimeConfig()
  const supabaseUrl = config.public?.supabaseUrl
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZHRjbHV4YmdvaGFjb3VudnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI1NTY1MCwiZXhwIjoyMDUyODMxNjUwfQ.VVEw8Bob9AjV_WeBsVHLdNKMRUWq2QLeBHAG8o1is7s'
  
  const client = createClient(supabaseUrl, serviceRoleKey)
  
  const results = {
    allowed: false,
    reason: '',
    currentUsage: {},
    limits: subscriptionInfo.limits,
    plan: subscriptionInfo.plan
  }

  try {
    // Get current usage for all resource types
    const [hivesResult, sensorsResult, apiariesResult, hubsResult, sensorUnitsResult] = await Promise.all([
      client.from('hives').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
      client.from('sensors').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('apiaries').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
      client.from('apiary_hubs').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      client.from('sensor_units').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    results.currentUsage = {
      hives: hivesResult.count || 0,
      sensors: sensorsResult.count || 0,
      apiaries: apiariesResult.count || 0,
      hubs: hubsResult.count || 0,
      sensor_units: sensorUnitsResult.count || 0
    }

    // Check limits based on action
    switch (action) {
      case 'create_hive':
        const maxHives = subscriptionInfo.limits.max_hives
        if (maxHives === -1) {
          results.allowed = true
        } else if (results.currentUsage.hives >= maxHives) {
          results.allowed = false
          results.reason = `Hive limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxHives} hive${maxHives === 1 ? '' : 's'}.`
        } else {
          results.allowed = true
        }
        break

      case 'create_sensor':
        const maxSensors = subscriptionInfo.limits.max_sensors_total
        if (maxSensors === -1) {
          results.allowed = true
        } else if (results.currentUsage.sensors >= maxSensors) {
          results.allowed = false
          results.reason = `Sensor limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxSensors} sensors total.`
        } else {
          // Check per-hive limit if assigning to a hive
          if (data.hive_id && subscriptionInfo.limits.max_sensors_per_hive !== -1) {
            const { count: hiveSensorCount } = await client
              .from('sensors')
              .select('id', { count: 'exact', head: true })
              .eq('hive_id', data.hive_id)

            if (hiveSensorCount >= subscriptionInfo.limits.max_sensors_per_hive) {
              results.allowed = false
              results.reason = `This hive already has the maximum of ${subscriptionInfo.limits.max_sensors_per_hive} sensors allowed.`
            } else {
              results.allowed = true
            }
          } else {
            results.allowed = true
          }
        }
        break

      case 'create_apiary':
        const maxApiaries = subscriptionInfo.limits.max_apiaries
        if (maxApiaries === -1) {
          results.allowed = true
        } else if (results.currentUsage.apiaries >= maxApiaries) {
          results.allowed = false
          results.reason = `Apiary limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxApiaries} apiar${maxApiaries === 1 ? 'y' : 'ies'}.`
        } else {
          results.allowed = true
        }
        break

      case 'create_hub':
        const maxHubs = subscriptionInfo.limits.max_hubs
        if (maxHubs === -1) {
          results.allowed = true
        } else if (results.currentUsage.hubs >= maxHubs) {
          results.allowed = false
          results.reason = `Hub limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxHubs} hub${maxHubs === 1 ? '' : 's'}.`
        } else {
          results.allowed = true
        }
        break

      case 'create_sensor_unit':
        // For sensor units, check if the target hive already has one
        if (!data.hive_id) {
          results.allowed = false
          results.reason = 'Sensor units must be assigned to a hive'
          break
        }

        // Check if this hive already has a sensor unit (1:1 constraint)
        const { count: existingSensorUnits } = await client
          .from('sensor_units')
          .select('id', { count: 'exact', head: true })
          .eq('hive_id', data.hive_id)

        if (existingSensorUnits > 0) {
          results.allowed = false
          results.reason = 'This hive already has a sensor unit. Each hive can only have one sensor unit.'
        } else {
          // Also check overall hive limits (since sensor units are 1:1 with hives)
          const maxHives = subscriptionInfo.limits.max_hives
          if (maxHives === -1) {
            results.allowed = true
          } else if (results.currentUsage.hives >= maxHives) {
            results.allowed = false
            results.reason = `Cannot create sensor unit: hive limit of ${maxHives} reached.`
          } else {
            results.allowed = true
          }
        }
        break

      default:
        results.allowed = true
    }

    return results
    
  } catch (error) {
    console.error('Subscription limits check error:', error)
    results.allowed = false
    results.reason = 'Unable to verify subscription limits'
    return results
  }
}