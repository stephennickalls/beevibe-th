// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // If no user is logged in, redirect to login
  if (!user.value) {
    return navigateTo('/auth/login')
  }
})