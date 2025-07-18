// server/utils/subscription.js - Updated subscription checker
export const checkUserSubscription = async (event, userId) => {
  const client = serverSupabaseClient(event)

  try {
    const { data, error } = await client
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
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
        features: {},
        limits: { max_hives: 1, max_sensors: 5 } // Default free limits
      }
    }

    return {
      hasActiveSubscription: true,
      plan: data.subscription_plans.name,
      features: data.subscription_plans.features,
      limits: data.subscription_plans.limits,
      subscription: data
    }
  } catch (error) {
    return {
      hasActiveSubscription: false,
      plan: 'free',
      features: {},
      limits: { max_hives: 1, max_sensors: 5 }
    }
  }
}
