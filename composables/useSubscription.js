// composables/useSubscription.js - Supabase-based subscription management
export const useSubscription = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const subscription = ref(null)

  const loadSubscription = async () => {
    if (!user.value) return null

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            features,
            limits
          )
        `)
        .eq('user_id', user.value.id)
        .eq('is_active', true)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        subscription.value = {
          hasActiveSubscription: false,
          plan: 'free',
          features: {},
          limits: { max_hives: 1, max_sensors: 5 }
        }
      } else {
        subscription.value = {
          hasActiveSubscription: true,
          plan: data.subscription_plans.name,
          features: data.subscription_plans.features,
          limits: data.subscription_plans.limits,
          subscription: data
        }
      }

      return subscription.value
    } catch (error) {
      subscription.value = {
        hasActiveSubscription: false,
        plan: 'free',
        features: {},
        limits: { max_hives: 1, max_sensors: 5 }
      }
      return subscription.value
    }
  }

  const hasFeature = (feature) => {
    return subscription.value?.features?.[feature] === true
  }

  const checkLimit = (limitType, currentCount) => {
    const limit = subscription.value?.limits?.[limitType]
    if (!limit) return { allowed: true, remaining: Infinity }
    
    return {
      allowed: currentCount < limit,
      remaining: Math.max(0, limit - currentCount),
      limit
    }
  }

  return {
    subscription: readonly(subscription),
    loadSubscription,
    hasFeature,
    checkLimit
  }
}