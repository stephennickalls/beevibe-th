<template>
  <aside class="hidden md:flex flex-col w-16 bg-gray-950 text-white shadow-md p-3">
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
          <img src="/images/BeeVibe-Logos/SVGs/Bee-Blue.svg" alt="BeeVibe Logo" class="w-6 h-6" />
        </div>
      </div>
      
      <!-- Main Navigation Icons -->
      <nav class="flex flex-col items-center space-y-4 flex-grow">
        <!-- Dashboard -->
        <NuxtLink to="/dashboard-v2" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/dashboard-v2' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
        </NuxtLink>
        
        <!-- Apiaries Link -->
        <NuxtLink to="/apiaries" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/apiaries') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Hives Link -->
        <NuxtLink to="/hives" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/hives') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-4 h-4" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
            <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z" fill="currentColor"/>
            <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z" fill="currentColor"/>
          </svg>
        </NuxtLink>
        
        <!-- Sensors Link -->
        <NuxtLink to="/sensors" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/sensors') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Analytics Link -->
        <NuxtLink to="/analytics" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/analytics') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
        </NuxtLink>
        
        <!-- Alerts Link -->
        <NuxtLink to="/alerts" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors relative" :class="isActiveRoute('/alerts') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <div v-if="alertCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {{ alertCount }}
          </div>
        </NuxtLink>
      </nav>
      
      <!-- Account Management Link (Bottom) -->
      <div class="mt-auto">
        <NuxtLink to="/account" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="isActiveRoute('/account') ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup>
// Props for alert count
defineProps({
  alertCount: {
    type: Number,
    default: 0
  }
})

const route = useRoute()

// Helper function to check if a route is active
const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>