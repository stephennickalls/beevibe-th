// composables/useSubscription.js - Fixed version
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
          max_sensors_total: 3 
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
          // No subscription found - user is on free plan
          console.log('No subscription found, defaulting to free plan')
          subscription.value = {
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
            max_sensors_total: 3
          },
          subscription: data
        }
      } else {
        // No data returned
        console.log('No data returned, defaulting to free plan')
        subscription.value = {
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
          max_sensors_total: 3 
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

  const getPlanLimits = () => {
    return {
      free: {
        max_hives: 1,
        max_sensors_per_hive: 3,
        max_sensors_total: 3,
        price: '$0/month'
      },
      basic: {
        max_hives: 3,
        max_sensors_per_hive: 5,
        max_sensors_total: 15,
        price: '$9.95/month'
      },
      pro: {
        max_hives: 15,
        max_sensors_per_hive: 5,
        max_sensors_total: 75,
        price: '$19.95/month'
      },
      enterprise: {
        max_hives: -1,
        max_sensors_per_hive: -1,
        max_sensors_total: -1,
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
        return 'Upgrade to Basic ($9.95/month) to get 3 hives and 15 sensors total'
      }
      if (currentUsage.sensors >= limits.max_sensors_total) {
        return 'Upgrade to Basic ($9.95/month) to get 5 sensors per hive'
      }
    } else if (plan === 'basic') {
      if (currentUsage.hives >= limits.max_hives || currentUsage.sensors >= limits.max_sensors_total) {
        return 'Upgrade to Pro ($19.95/month) to get 15 hives and 75 sensors total'
      }
    } else if (plan === 'pro') {
      if (currentUsage.hives >= limits.max_hives || currentUsage.sensors >= limits.max_sensors_total) {
        return 'Contact sales for Enterprise plan with unlimited hives and sensors'
      }
    }
    
    return ''
  }

  return {
    subscription: readonly(subscription),
    loadSubscription,
    hasFeature,
    checkLimit,
    getPlanLimits,
    getUpgradeMessage
  }
}