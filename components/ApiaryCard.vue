<template>
  <div 
    @click="$emit('click', apiary)"
    class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600"
  >
    <!-- Apiary Header -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-lg truncate">{{ apiary.name }}</h3>
        <p v-if="apiary.description" class="text-xs text-gray-400 truncate">
          {{ apiary.description }}
        </p>
        <p v-else class="text-xs text-gray-400">No description</p>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <div :class="apiary.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
        <span class="text-xs" :class="apiary.is_active ? 'text-green-400' : 'text-gray-400'">
          {{ apiary.is_active ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>

    <!-- Location Info -->
    <div v-if="apiary.address || (apiary.latitude && apiary.longitude)" class="mb-4">
      <div v-if="apiary.address" class="flex items-center space-x-2 mb-1">
        <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <span class="text-xs text-gray-300 truncate">{{ apiary.address }}</span>
      </div>
      <div v-if="apiary.latitude && apiary.longitude" class="flex items-center space-x-2">
        <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
        </svg>
        <span class="text-xs text-gray-400">
          {{ parseFloat(apiary.latitude).toFixed(4) }}, {{ parseFloat(apiary.longitude).toFixed(4) }}
        </span>
      </div>
    </div>

    <!-- Hives Section -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-300">Hives</h4>
        <span class="text-xs text-gray-400">{{ apiary.hive_count || 0 }} total</span>
      </div>
      
      <!-- No Hives State -->
      <div v-if="!apiary.hives || apiary.hives.length === 0" class="text-center py-6 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
          <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z" fill="currentColor"/>
          <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z" fill="currentColor"/>
        </svg>
        <p class="text-xs text-gray-500">No hives assigned</p>
        <p class="text-xs text-gray-600 mt-1">Click to add hives</p>
      </div>
      
      <!-- Hives Grid - Auto-sizing grid that grows both horizontally and vertically -->
      <div v-else class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
        <div
          v-for="hive in apiary.hives"
          :key="hive.id"
          class="min-w-0"
        >
          <HiveCard
            :hive="hive"
            @click="$emit('hive-click', hive, apiary)"
          />
        </div>
      </div>
    </div>

    <!-- Apiary Footer -->
    <div class="flex justify-between items-center pt-3 mt-3 border-t border-gray-700">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-400">
          {{ apiary.installation_date ? `Created ${formatDate(apiary.installation_date)}` : 'Recently created' }}
        </span>
      </div>
      <span class="text-xs text-blue-400">View Apiary Details →</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HiveCard from './HiveCard.vue'

// Props
const props = defineProps({
  apiary: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click', 'hive-click'])

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}
</script>