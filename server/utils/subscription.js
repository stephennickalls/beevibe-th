// server/utils/subscription.js - Updated with new tier structure
export const checkUserSubscription = async (event, userId) => {
  const client = serverSupabaseClient(event)

  try {
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
      // Default to free plan
      return {
        hasActiveSubscription: false,
        plan: 'free',
        planDisplayName: 'Free',
        features: {},
        limits: { 
          max_hives: 1, 
          max_sensors_per_hive: 3, 
          max_sensors_total: 3 
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
    return {
      hasActiveSubscription: false,
      plan: 'free',
      planDisplayName: 'Free',
      features: {},
      limits: { 
        max_hives: 1, 
        max_sensors_per_hive: 3, 
        max_sensors_total: 3 
      }
    }
  }
}

// Utility to check if user can perform action
export const checkSubscriptionLimits = async (event, userId, action, data = {}) => {
  const subscriptionInfo = await checkUserSubscription(event, userId)
  const client = serverSupabaseClient(event)
  
  const results = {
    allowed: false,
    reason: '',
    currentUsage: {},
    limits: subscriptionInfo.limits,
    plan: subscriptionInfo.plan
  }

  try {
    // Get current usage
    const [hivesResult, sensorsResult] = await Promise.all([
      client.from('hives').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
      client.from('sensors').select('id', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    results.currentUsage = {
      hives: hivesResult.count || 0,
      sensors: sensorsResult.count || 0
    }

    // Check limits based on action
    switch (action) {
      case 'create_hive':
        const maxHives = subscriptionInfo.limits.max_hives
        if (maxHives === -1) {
          results.allowed = true
        } else if (results.currentUsage.hives >= maxHives) {
          results.allowed = false
          results.reason = `Hive limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxHives} hive${maxHives === 1 ? '' : 's'}. Upgrade to add more hives.`
        } else {
          results.allowed = true
        }
        break

      case 'create_sensor':
        const hiveId = data.hive_id
        const maxSensorsTotal = subscriptionInfo.limits.max_sensors_total
        const maxSensorsPerHive = subscriptionInfo.limits.max_sensors_per_hive
        
        // Check total sensor limit
        if (maxSensorsTotal !== -1 && results.currentUsage.sensors >= maxSensorsTotal) {
          results.allowed = false
          results.reason = `Total sensor limit reached. Your ${subscriptionInfo.planDisplayName} plan allows ${maxSensorsTotal} sensors. Upgrade to add more sensors.`
          break
        }

        // Check per-hive sensor limit if hive_id provided
        if (hiveId && maxSensorsPerHive !== -1) {
          const { count: hivesSensorCount } = await client
            .from('sensors')
            .select('id', { count: 'exact', head: true })
            .eq('hive_id', hiveId)

          if (hivesSensorCount >= maxSensorsPerHive) {
            results.allowed = false
            results.reason = `Sensor limit reached for this hive. Each hive can have up to ${maxSensorsPerHive} sensors on your ${subscriptionInfo.planDisplayName} plan.`
            break
          }
        }

        results.allowed = true
        break

      default:
        results.allowed = true
    }

  } catch (error) {
    console.error('Error checking subscription limits:', error)
    results.allowed = false
    results.reason = 'Unable to verify subscription limits'
  }

  return results
}