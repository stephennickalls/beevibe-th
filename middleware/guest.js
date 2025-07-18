// middleware/guest.js - Redirect authenticated users from auth pages
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // If user is authenticated and trying to access guest-only pages
  if (user.value && (to.path.startsWith('/auth/'))) {
    return navigateTo('/dashboard-v2')
  }
})