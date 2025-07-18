// server/utils/supabase-auth.js - Server-side user verification
export const getServerUser = async (event) => {
  const client = await serverSupabaseUser(event)
  return client
}

export const requireAuth = async (event) => {
  const user = await getServerUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  return user
}
