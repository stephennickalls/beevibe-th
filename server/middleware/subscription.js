// server/middleware/subscription.js - Subscription-based access control
export default defineEventHandler(async (event) => {
  // Routes that require subscription checks
  const subscriptionRoutes = [
    '/api/hives',
    '/api/sensors',
    '/api/advanced-analytics'
  ]

  const needsSubscriptionCheck = subscriptionRoutes.some(route => 
    event.node.req.url?.startsWith(route)
  )

  if (!needsSubscriptionCheck) return

  // User must be authenticated first (handled by auth middleware)
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check subscription status
  const subscriptionInfo = await checkUserSubscription(event.context.user.userId)
  
  if (!subscriptionInfo.hasActiveSubscription) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Active subscription required'
    })
  }

  // Add subscription info to context
  event.context.subscription = subscriptionInfo
})