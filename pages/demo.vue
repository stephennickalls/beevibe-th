<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 font-open-sans flex items-center justify-center p-4">
    <!-- Main Container -->
    <div class="w-full max-w-7xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex">
      <!-- Left Side - Hero Section (brand yellow) -->
      <div class="hidden lg:flex lg:w-1/2 bg-brand-yellow relative overflow-hidden">
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

          <!-- Center - Message -->
          <div class="text-center space-y-6">
            <h1 class="text-4xl font-bold leading-tight text-black">
              BeeVibe Demo
            </h1>
            <p class="text-black/80 max-w-md mx-auto">
              A guided preview of the hive dashboard, alerts, and sensor trends.
              Sign up below and we’ll notify you as soon as it’s ready.
            </p>

            <!-- Simple Line -->
            <div class="flex justify-center mt-8">
              <div class="w-24 h-0.5 bg-black"></div>
            </div>
          </div>

          <div></div>
        </div>
      </div>

      <!-- Right Side - Coming Soon -->
      <div class="w-full lg:w-1/2 bg-gray-850 p-8 lg:p-12 flex items-center">
        <div class="w-full">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8">
            <img src="/images/BeeVibe-Logos/SVGs/BeeVibe-Logo-White.svg" alt="BeeVibe" class="h-8 mx-auto" />
          </div>

          <!-- Header -->
          <div class="mb-8 text-center lg:text-left">
            <h2 class="text-3xl font-bold text-white mb-3">Demo coming soon</h2>
            <p class="text-gray-400">
              We’re putting the finishing touches on the interactive demo. Be first in line:
            </p>
          </div>

          <!-- CTA Card -->
          <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6">
            <ul class="space-y-3 text-gray-300 mb-6">
              <li class="flex items-start">
                <svg class="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Real-time charts for weight, temperature, and humidity
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Alerting and simple health signals
              </li>
              <li class="flex items-start">
                <svg class="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                ESP32 → Nuxt 3 + Supabase pipeline
              </li>
            </ul>

            <div class="flex flex-col sm:flex-row gap-3">
              <!-- Register Interest anchors to the index landing form -->
              <NuxtLink
                to="/#register"
                class="w-full sm:w-auto text-center bg-brand-yellow hover:bg-brand-yellow-hover text-black font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Register Interest
              </NuxtLink>
              <NuxtLink
                to="/"
                class="w-full sm:w-auto text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Back to Home
              </NuxtLink>
            </div>

            <p class="text-xs text-gray-500 mt-4">
              We’ll only use your email to notify you about the demo and early access program.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'guest'
})

useHead({
  title: 'Demo – BeeVibe',
  meta: [{ name: 'description', content: 'See how BeeVibe monitors hives in real time. Demo coming soon.' }]
})
</script>

<style scoped>
.font-open-sans { font-family: "Open Sans", sans-serif; }

/* Brand colors - fallbacks for Tailwind */
.bg-brand-yellow { background-color: #F9E900; }
.text-brand-yellow { color: #F9E900; }
.hover\:bg-brand-yellow-hover:hover { background-color: #E6D200; }

/* Grays used in login page */
.bg-gray-850 { background-color: #1f2937; }
.hover\:bg-gray-750:hover { background-color: #374151; }
</style>
