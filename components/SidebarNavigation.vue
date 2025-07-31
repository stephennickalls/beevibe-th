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
        <NuxtLink to="/dashboard-v2" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/dashboard-v2' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
        </NuxtLink>
        
        <!-- Hives Link -->
        <NuxtLink to="/hives" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/hives' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-4 h-4" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="55" height="10" rx="2" fill="currentColor"/>
            <rect y="13" width="55" height="15" rx="2" fill="currentColor"/>
            <path d="M53 31C54.1046 31 55 31.8954 55 33V54C55 55.1046 54.1046 56 53 56H2C0.895431 56 0 55.1046 0 54V33C0 31.8954 0.895431 31 2 31H53ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
          </svg>
        </NuxtLink>
        
        <!-- Sensors Link -->
        <NuxtLink to="/sensors" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/sensors' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
        </NuxtLink>
        
        <NuxtLink to="/analytics" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/analytics' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
          </svg>
        </NuxtLink>
        
        <NuxtLink to="/alerts" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors relative" :class="$route.path === '/alerts' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
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
        <NuxtLink to="/account" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors" :class="$route.path === '/account' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'">
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
</script>
