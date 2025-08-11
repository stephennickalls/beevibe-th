<!-- pages/register-interest.vue -->
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
              Join the Future of<br>
              Smart Beekeeping
            </h1>
            
            <!-- Simple Line -->
            <div class="flex justify-center mt-8">
              <div class="w-24 h-0.5 bg-black"></div>
            </div>
            
            <p class="text-lg text-black opacity-80">
              Be the first to know when we launch
            </p>
          </div>
          
          <!-- Bottom spacer -->
          <div></div>
        </div>
      </div>

      <!-- Right Side - Register Interest Form -->
      <div class="w-full lg:w-1/2 bg-gray-850 p-8 lg:p-12 flex flex-col justify-center">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-8">
          <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-White.svg" alt="BeeVibe" class="h-8 mx-auto" />
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-white mb-4">Register Your Interest</h2>
          <p class="text-gray-400">
            Get early access and exclusive updates about BeeVibe's launch.
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Name Field -->
          <div>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              :disabled="loading"
              class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-20 focus:outline-none transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              placeholder="Full name"
            />
          </div>

          <!-- Email Field -->
          <div>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :disabled="loading"
              class="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow focus:ring-opacity-20 focus:outline-none transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
              placeholder="Email address"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-4">
            <p class="text-green-300 text-sm font-medium">{{ success }}</p>
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
              Registering...
            </span>
            <span v-else>Register Interest</span>
          </button>
        </form>

        <!-- Privacy Note -->
        <div class="text-center mt-8">
          <p class="text-xs text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>

        <!-- Footer Link -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-400">
            Already have an account? 
            <NuxtLink to="/auth/login" class="text-brand-yellow hover:text-brand-yellow-hover font-medium underline">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Explicitly set no middleware - accessible to everyone
definePageMeta({
  middleware: []
})

const form = ref({
  name: '',
  email: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleRegister = async () => {
  if (loading.value) return
  
  // Reset messages
  error.value = ''
  success.value = ''
  
  // Client-side validation
  if (!form.value.name.trim()) {
    error.value = 'Name is required'
    return
  }
  
  if (!form.value.email.trim()) {
    error.value = 'Email is required'
    return
  }
  
  if (!isValidEmail(form.value.email)) {
    error.value = 'Please enter a valid email address'
    return
  }
  
  loading.value = true

  try {
    // Call API endpoint
    const response = await $fetch('/api/register-interest', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        email: form.value.email.trim()
      }
    })

    // Show success message
    success.value = `Thank you ${form.value.name}! We'll be in touch soon with exclusive updates about BeeVibe's launch.`
    
    // Clear form
    form.value = {
      name: '',
      email: ''
    }
    
  } catch (err) {
    console.error('Registration error:', err)
    
    // Handle different error types
    if (err.statusCode === 409) {
      error.value = 'This email is already registered for updates.'
    } else if (err.statusCode === 400) {
      error.value = err.statusMessage || 'Please check your information and try again.'
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Register Interest - BeeVibe',
  meta: [
    { name: 'description', content: 'Register your interest in BeeVibe and be the first to know when we launch our smart beekeeping platform.' }
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