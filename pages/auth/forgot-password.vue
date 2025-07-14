<!-- pages/auth/forgot-password.vue -->
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Reset Password</h1>
        <p>Enter your email and we'll send you a reset link</p>
      </div>

      <form @submit.prevent="handleReset" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            placeholder="your@email.com"
          />
        </div>

        <button type="submit" :disabled="loading" class="auth-button">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>
      </form>

      <div class="auth-links">
        <NuxtLink to="/auth/login" class="back-link">
          ← Back to Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  auth: false
})

const supabase = useSupabaseClient()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const handleReset = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (resetError) {
      error.value = resetError.message
      return
    }

    success.value = 'Reset link sent! Check your email for instructions.'
    
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Password reset error:', err)
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Reset Password - BeeVibe'
})
</script>

<style scoped>
/* Inherit styles from login page */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #d1f661 0%, #a8e6cf 100%);
  padding: 2rem;
}

.auth-card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #6b7280;
  font-size: 1rem;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #d1f661;
  box-shadow: 0 0 0 3px rgba(209, 246, 97, 0.1);
}

.auth-button {
  width: 100%;
  background: #1f2937;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-button:hover:not(:disabled) {
  background: #111827;
}

.auth-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.success-message {
  background: #f0fdf4;
  color: #15803d;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.auth-links {
  text-align: center;
}

.back-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
}

.back-link:hover {
  color: #1f2937;
}
</style>