// server/api/user/profile.get.js - Get user profile with subscription
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const subscriptionInfo = await checkUserSubscription(event, user.id)
  
  const client = serverSupabaseClient(event)

  try {
    // Get user profile
    const { data: profile, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        ...profile
      },
      subscription: subscriptionInfo
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})