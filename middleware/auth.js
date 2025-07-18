// middleware/auth.js - Supabase client-side authentication
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // If user is not authenticated and trying to access protected route
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})