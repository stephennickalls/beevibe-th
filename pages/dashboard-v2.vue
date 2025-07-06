<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Menu (hidden on mobile) -->
    <aside class="hidden md:flex flex-col w-60 bg-gray-950 text-white shadow-md p-4">
      <div class="flex flex-col items-center mb-10">
        <img src="/images/BeeVibe-Logos/SVGs/Bee-Blue.svg" alt="BeeVibe Logo" class="w-12 h-12 mb-2" />
        <h1 class="text-2xl font-bold tracking-wide">BeeVibe</h1>
      </div>
      <nav class="flex flex-col items-center space-y-8">
        <NuxtLink to="/dashboard-v2" class="hover:text-blue-400">Dashboard</NuxtLink>
        <NuxtLink to="/hives" class="hover:text-blue-400 flex flex-col items-center">
          <img src="/images/Hive-Icon.svg" alt="Hive Icon" class="w-10 h-10 mb-1" />
          <span class="text-sm">Hives</span>
        </NuxtLink>
        <NuxtLink to="/sensors" class="hover:text-blue-400 flex flex-col items-center">
          <img src="/images/Sensor-Cloud-Icon.svg" alt="Sensor Icon" class="w-10 h-10 mb-1" />
          <span class="text-sm">Sensors</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="hover:text-blue-400">Settings</NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Header -->
      <div class="flex justify-between items-center mb-6 md:hidden">
        <div class="flex items-center">
          <img src="/images/BeeVibe-Logos/SVGs/Bee-Blue.svg" alt="BeeVibe Logo" class="w-6 h-6 mr-2" />
          <h1 class="text-xl font-bold">BeeVibe</h1>
        </div>
        <button @click="menuOpen = !menuOpen" class="text-white focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="menuOpen" class="md:hidden mb-4 bg-gray-800 rounded shadow p-4 text-white">
        <NuxtLink to="/dashboard-v2" class="block py-2">Dashboard</NuxtLink>
        <NuxtLink to="/hives" class="block py-2">Hives</NuxtLink>
        <NuxtLink to="/sensors" class="block py-2">Sensors</NuxtLink>
        <NuxtLink to="/settings" class="block py-2">Settings</NuxtLink>
      </div>

      <!-- Hive Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="hive in hives" :key="hive.id" class="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
          <h2 class="text-lg font-bold mb-1">{{ hive.name }}</h2>
          <p class="text-sm text-gray-400 mb-2">{{ hive.description || 'No description' }}</p>
          <div class="text-sm space-y-1">
            <p>🌡️ Temperature: <strong>{{ Number(hive.temperature).toFixed(2) }}°C</strong></p>
            <p>💧 Humidity: <strong>{{ Number(hive.humidity).toFixed(2) }}%</strong></p>
            <p>⚖️ Weight: <strong>{{ Number(hive.weight).toFixed(2) }} g</strong></p>
          </div>
          <NuxtLink :to="`/hives/${hive.uuid}`" class="mt-3 inline-block text-blue-400 hover:underline text-sm">View Details →</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const menuOpen = ref(false)
const hives = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/api/hives')
    hives.value = await response.json()
  } catch (error) {
    console.error('Failed to load hive data:', error)
  }
})
</script>

<style scoped>
/* Tailwind handles most styling */
</style>
