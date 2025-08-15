// UPDATED composables/useSubscription.js - Fixed for 1 sensor unit per hive
export const useSubscription = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const subscription = ref(null)

  const loadSubscription = async () => {
    if (!user.value) {
      console.log('No user found, defaulting to free plan')
      subscription.value = {
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
      return subscription.value
    }

    try {
      console.log('Loading subscription for user:', user.value.id)
      
      const { data, error } = await supabase
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
        .eq('user_id', user.value.id)
        .eq('is_active', true)
        .eq('status', 'active')
        .single()

      if (error) {
        console.log('Subscription query error:', error)
        if (error.code === 'PGRST116') {
          subscription.value = {
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
        } else {
          throw error
        }
      } else if (data) {
        console.log('Subscription found:', data)
        subscription.value = {
          hasActiveSubscription: true,
          plan: data.subscription_plans.name,
          planDisplayName: data.subscription_plans.display_name,
          features: data.subscription_plans.features || {},
          limits: data.subscription_plans.limits || {
            max_hives: 1, 
            max_sensors_per_hive: 3, 
            max_sensors_total: 3,
            max_apiaries: 1,
            max_hubs: 1
          },
          subscription: data
        }
      } else {
        subscription.value = {
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

      console.log('Final subscription value:', subscription.value)
      return subscription.value
      
    } catch (error) {
      console.error('Error loading subscription:', error)
      subscription.value = {
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
      return subscription.value
    }
  }

  const hasFeature = (feature) => {
    return subscription.value?.features?.[feature] === true
  }

  const checkLimit = (limitType, currentCount, hiveId = null) => {
    if (!subscription.value) return { allowed: false, remaining: 0, limit: 0 }
    
    const limit = subscription.value.limits[limitType]
    if (limit === -1) return { allowed: true, remaining: Infinity, limit: -1 }
    
    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit
    }
  }

  // Enhanced method to check multiple resource types
  const checkResourceLimit = (resourceType, currentCount, additionalData = {}) => {
    if (!subscription.value) return { allowed: false, remaining: 0, limit: 0, reason: 'No subscription found' }
    
    const limits = subscription.value.limits
    
    switch (resourceType) {
      case 'hive':
        return checkLimit('max_hives', currentCount)
        
      case 'sensor':
        // Check total sensor limit first
        const totalLimit = checkLimit('max_sensors_total', currentCount)
        if (!totalLimit.allowed) {
          return { ...totalLimit, reason: `Total sensor limit of ${totalLimit.limit} reached` }
        }
        
        // If assigning to a hive, check per-hive limit
        if (additionalData.hive_id && limits.max_sensors_per_hive !== -1) {
          const perHiveLimit = limits.max_sensors_per_hive
          const currentHiveSensorCount = additionalData.hiveSensorCount || 0
          
          if (currentHiveSensorCount >= perHiveLimit) {
            return { 
              allowed: false, 
              remaining: 0, 
              limit: perHiveLimit,
              reason: `This hive already has ${perHiveLimit} sensors (limit per hive)`
            }
          }
        }
        
        return totalLimit
        
      case 'apiary':
        return checkLimit('max_apiaries', currentCount)
        
      case 'hub':
        return checkLimit('max_hubs', currentCount)
        
      case 'sensor_unit':
        // Sensor units are 1:1 with hives, so check hive limit instead
        const hiveLimit = checkLimit('max_hives', currentCount)
        return {
          ...hiveLimit,
          reason: hiveLimit.allowed ? 
            'Sensor unit allowed (1 per hive)' : 
            `Cannot create sensor unit: hive limit of ${hiveLimit.limit} reached`
        }
        
      default:
        return { allowed: false, remaining: 0, limit: 0, reason: 'Unknown resource type' }
    }
  }

  const getPlanLimits = () => {
    return {
      free: {
        max_hives: 1,
        max_sensors_per_hive: 3,
        max_sensors_total: 3,
        max_apiaries: 1,
        max_hubs: 1,
        // max_sensor_units = max_hives (1:1 relationship)
        price: '$0/month'
      },
      basic: {
        max_hives: 3,
        max_sensors_per_hive: 5,
        max_sensors_total: 15,
        max_apiaries: 2,
        max_hubs: 2,
        // max_sensor_units = max_hives (1:1 relationship)
        price: '$9.95/month'
      },
      pro: {
        max_hives: 15,
        max_sensors_per_hive: 5,
        max_sensors_total: 75,
        max_apiaries: 5,
        max_hubs: 5,
        // max_sensor_units = max_hives (1:1 relationship)
        price: '$19.95/month'
      },
      enterprise: {
        max_hives: -1,
        max_sensors_per_hive: -1,
        max_sensors_total: -1,
        max_apiaries: -1,
        max_hubs: -1,
        // max_sensor_units = max_hives (1:1 relationship)
        price: 'Contact Sales'
      }
    }
  }

  const getUpgradeMessage = (currentUsage) => {
    if (!subscription.value) return ''
    
    const plan = subscription.value.plan
    const limits = subscription.value.limits
    
    if (plan === 'free') {
      if (currentUsage.hives >= limits.max_hives) {
        return 'Upgrade to Basic ($9.95/month) to get 3 hives (with 3 sensor units), 2 apiaries, and 2 hubs'
      }
      if (currentUsage.sensors >= limits.max_sensors_total) {
        return 'Upgrade to Basic ($9.95/month) to get 5 sensors per hive (15 total)'
      }
      if (currentUsage.apiaries >= limits.max_apiaries) {
        return 'Upgrade to Basic ($9.95/month) to get 2 apiaries'
      }
      if (currentUsage.hubs >= limits.max_hubs) {
        return 'Upgrade to Basic ($9.95/month) to get 2 hubs'
      }
    } else if (plan === 'basic') {
      if (currentUsage.hives >= limits.max_hives || currentUsage.sensors >= limits.max_sensors_total) {
        return 'Upgrade to Pro ($19.95/month) to get 15 hives (with 15 sensor units), 5 apiaries, and 75 sensors total'
      }
      if (currentUsage.apiaries >= limits.max_apiaries) {
        return 'Upgrade to Pro ($19.95/month) to get 5 apiaries'
      }
      if (currentUsage.hubs >= limits.max_hubs) {
        return 'Upgrade to Pro ($19.95/month) to get 5 hubs'
      }
    } else if (plan === 'pro') {
      const atLimit = currentUsage.hives >= limits.max_hives || 
                     currentUsage.sensors >= limits.max_sensors_total ||
                     currentUsage.apiaries >= limits.max_apiaries ||
                     currentUsage.hubs >= limits.max_hubs
      if (atLimit) {
        return 'Contact sales for Enterprise plan with unlimited resources'
      }
    }
    
    return ''
  }

  // Updated to reflect 1:1 relationship
  const getCurrentUsage = async () => {
    if (!user.value) return {}
    
    try {
      const [hivesResult, sensorsResult, apiariesResult, hubsResult, sensorUnitsResult] = await Promise.all([
        supabase.from('hives').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id).eq('is_active', true),
        supabase.from('sensors').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id),
        supabase.from('apiaries').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id).eq('is_active', true),
        supabase.from('apiary_hubs').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id),
        supabase.from('sensor_units').select('id', { count: 'exact', head: true }).eq('user_id', user.value.id)
      ])

      const usage = {
        hives: hivesResult.count || 0,
        sensors: sensorsResult.count || 0,
        apiaries: apiariesResult.count || 0,
        hubs: hubsResult.count || 0,
        sensor_units: sensorUnitsResult.count || 0
      }

      // Validate 1:1 relationship constraint
      if (usage.sensor_units > usage.hives) {
        console.warn(`Data integrity issue: ${usage.sensor_units} sensor units but only ${usage.hives} hives. Should be 1:1 relationship.`)
      }

      return usage
    } catch (error) {
      console.error('Error getting current usage:', error)
      return {
        hives: 0,
        sensors: 0,
        apiaries: 0,
        hubs: 0,
        sensor_units: 0
      }
    }
  }

  return {
    subscription: readonly(subscription),
    loadSubscription,
    hasFeature,
    checkLimit,
    checkResourceLimit,
    getPlanLimits,
    getUpgradeMessage,
    getCurrentUsage
  }
}

