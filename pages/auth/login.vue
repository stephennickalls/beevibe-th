<!-- pages/auth/login.vue - Optimized version -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-open-sans flex items-center justify-center p-4">
    <!-- Main Container -->
    <div class="w-full max-w-7xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex">
      <!-- Left Side - Hero Section -->
      <div class="hidden lg:flex lg:w-1/2 bg-brand-yellow relative overflow-hidden">
        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-between p-12 text-black w-full h-full">
          <!-- Top - Back Button and Logo -->
          <div class="flex justify-between items-start">
            <NuxtLink 
              to="/" 
              class="flex items-center space-x-2 text-sm text-black hover:text-gray-700 transition-colors font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>Back to website</span>
            </NuxtLink>
            <div class="flex items-center space-x-3">
              <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-Black.svg" alt="BeeVibe" class="h-12" />
            </div>
          </div>
          
          <!-- Center - Main Message -->
          <div class="text-center space-y-6">
            <h1 class="text-4xl font-bold leading-tight text-black">
              Real-Time Insights<br>
              For a Healthier Hive
            </h1>
            
            <!-- Simple Line -->
            <div class="flex justify-center mt-8">
              <div class="w-24 h-0.5 bg-black"></div>
            </div>
          </div>
          
          <!-- Bottom spacer -->
          <div></div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="w-full lg:w-1/2 bg-gray-850 p-8 lg:p-12 flex flex-col justify-center">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-White.svg" alt="BeeVibe" class="h-8 mx-auto" />
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p class="text-gray-400">
            Don't have an account? 
            <NuxtLink to="/auth/register" class="text-brand-yellow hover:text-brand-yellow-hover font-medium underline">
              Sign up
            </NuxtLink>
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Field -->
          <div>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="loading"
              class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-20 focus:outline-none transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              placeholder="Email"
            />
          </div>

          <!-- Password Field -->
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              :disabled="loading"
              class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-20 focus:outline-none transition-all disabled:bg-gray-700 disabled:cursor-not-allowed pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.464 1.415m5.15 5.15l1.414-1.414M14.828 14.828a3 3 0 00.464-1.415m-2.122 2.122L8.464 8.464m.707-.707l2.122 2.122m0 0a3 3 0 013.536 3.536M14.828 14.828l.707.707" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          <!-- Terms Checkbox -->
          <div class="flex items-start space-x-3">
            <input
              id="terms"
              v-model="form.terms"
              type="checkbox"
              required
              class="w-4 h-4 text-brand-yellow bg-gray-800 border-gray-600 rounded focus:ring-brand-yellow focus:ring-2 mt-1"
            />
            <label for="terms" class="text-sm text-gray-400">
              I agree to the 
              <a href="#" class="text-brand-yellow hover:text-brand-yellow-hover font-medium underline">Terms & Conditions</a>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-brand-yellow hover:bg-brand-yellow-hover disabled:bg-gray-600 text-black font-semibold py-4 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-gray-850 text-gray-500">Or sign in with</span>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            @click="signInWithGoogle"
            :disabled="loading"
            class="flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            @click="signInWithApple"
            :disabled="loading"
            class="flex items-center justify-center px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <!-- Footer Link -->
        <div class="text-center mt-8">
          <NuxtLink 
            to="/auth/forgot-password" 
            class="text-sm text-gray-400 hover:text-brand-yellow transition-colors"
          >
            Forgot your password?
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Change this to use the guest middleware instead of auth: false
definePageMeta({
  middleware: 'guest'
})

const supabase = useSupabaseClient()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  terms: false
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authError) {
      error.value = authError.message
      return
    }

    // Success! Redirect to dashboard
    await router.push('/dashboard-v2')
    
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

// Social login functions
const signInWithGoogle = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard-v2`
      }
    })

    if (authError) {
      error.value = authError.message
      loading.value = false
    }
    // Don't set loading to false here - the redirect will handle it
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Google login error:', err)
    loading.value = false
  }
}

const signInWithApple = async () => {
  if (loading.value) return
  
  loading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/dashboard-v2`
      }
    })

    if (authError) {
      error.value = authError.message
      loading.value = false
    }
    // Don't set loading to false here - the redirect will handle it
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Apple login error:', err)
    loading.value = false
  }
}

useHead({
  title: 'Sign In - BeeVibe',
  meta: [
    { name: 'description', content: 'Sign in to your BeeVibe account' }
  ]
})
</script>

<style scoped>
/* Tailwind custom color fallbacks */
.font-open-sans {
  font-family: "Open Sans", sans-serif;
}

/* Brand colors - fallbacks for Tailwind */
.bg-brand-yellow {
  background-color: #F9E900;
}

.text-brand-yellow {
  color: #F9E900;
}

.hover\:text-brand-yellow-hover:hover {
  color: #E6D200;
}

.hover\:bg-brand-yellow-hover:hover {
  background-color: #E6D200;
}

.focus\:border-brand-yellow:focus {
  border-color: #F9E900;
}

.focus\:ring-brand-yellow:focus {
  --tw-ring-color: #F9E900;
}

/* Gray colors - fallbacks */
.bg-gray-850 {
  background-color: #1f2937;
}

.hover\:bg-gray-750:hover {
  background-color: #374151;
}
</style>