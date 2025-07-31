<template>
  <div>
    <!-- Mobile Header -->
    <div class="flex justify-between items-center mb-6 md:hidden">
      <div class="flex items-center">
        <img src="/images/BeeVibe-Logos/SVGs/Bee-Blue.svg" alt="BeeVibe Logo" class="w-6 h-6 mr-2" />
        <h1 class="text-xl font-bold">BeeVibe</h1>
      </div>
      <button @click="toggleMenu" class="text-white focus:outline-none">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden mb-4 bg-gray-800 rounded shadow p-4 text-white">
      <NuxtLink to="/dashboard-v2" class="block py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">Dashboard</NuxtLink>
      <NuxtLink to="/hives" class="block py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">Hives</NuxtLink>
      <NuxtLink to="/sensors" class="block py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">Sensors</NuxtLink>
      <NuxtLink to="/analytics" class="block py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">Analytics</NuxtLink>
      <NuxtLink to="/alerts" class="flex items-center py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">
        <span>Alerts</span>
        <div v-if="alertCount > 0" class="ml-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
          {{ alertCount }}
        </div>
      </NuxtLink>
      <NuxtLink to="/account" class="block py-2 hover:bg-gray-700 rounded px-2 transition-colors" @click="closeMenu">Account</NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Props for alert count
defineProps({
  alertCount: {
    type: Number,
    default: 0
  }
})

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

// Close menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  isOpen.value = false
})
</script>