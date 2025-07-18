// server/middleware/auth.js - Server middleware for API protection
export default defineEventHandler(async (event) => {
  // Only apply to API routes that need authentication
  const protectedRoutes = [
    '/api/hives',
    '/api/sensors',
    '/api/queen-status',
    '/api/alerts',
    '/api/user-profiles',
    '/api/inspections'
  ]

  // Check if current route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    event.node.req.url?.startsWith(route)
  )

  if (!isProtectedRoute) return

  // Extract token from Authorization header
  const token = extractToken(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided'
    })
  }

  // Verify token
  const payload = verifyToken(token)
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  // Add user info to event context
  event.context.user = payload
})
