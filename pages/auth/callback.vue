<!-- pages/auth/callback.vue -->
<template>
  <div class="callback-page">
    <div class="callback-card">
      <div class="loading-spinner"></div>
      <h2>{{ message }}</h2>
      <p>{{ submessage }}</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  auth: false
})

const router = useRouter()
const route = useRoute()

const message = ref('Completing sign in...')
const submessage = ref('Please wait while we redirect you.')

onMounted(async () => {
  // Check for error in URL params
  if (route.query.error) {
    message.value = 'Sign in failed'
    submessage.value = route.query.error_description || 'Please try signing in again.'
    
    setTimeout(() => {
      router.push('/auth/login')
    }, 3000)
    return
  }

  // Check for successful auth
  if (route.hash) {
    // Supabase handles the callback automatically
    // Just redirect to dashboard after a brief delay
    message.value = 'Sign in successful!'
    submessage.value = 'Redirecting to your dashboard...'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } else {
    // No hash, redirect to login
    router.push('/auth/login')
  }
})

useHead({
  title: 'Completing Sign In - BeeVibe'
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d1f661 0%, #a8e6cf 100%);
}

.callback-card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #1f2937;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

p {
  color: #6b7280;
  margin: 0;
}
</style>