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

    <!-- Hives List -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-300">Hives</h4>
        <span class="text-xs text-gray-400">{{ apiary.hive_count || 0 }} total</span>
      </div>
      
      <!-- No Hives State -->
      <div v-if="!apiary.hives || apiary.hives.length === 0" class="text-center py-6 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <p class="text-xs text-gray-500">No hives assigned</p>
        <p class="text-xs text-gray-600 mt-1">Click to add hives</p>
      </div>
      
      <!-- Hives List -->
      <div v-else class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="hive in apiary.hives"
          :key="hive.id"
          @click.stop="$emit('hive-click', hive, apiary)"
          class="bg-gray-900 rounded-lg p-3 hover:bg-gray-800 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-sm font-medium truncate">{{ hive.name || `Hive ${hive.id}` }}</span>
                <div :class="hive.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-1.5 h-1.5 rounded-full flex-shrink-0"></div>
              </div>
              <div class="flex items-center space-x-3 text-xs text-gray-400">
                <span v-if="hive.sensor_count">{{ hive.sensor_count }} sensors</span>
                <span v-if="hive.installation_date">{{ formatDate(hive.installation_date) }}</span>
              </div>
            </div>
            <div class="text-xs text-blue-400 flex-shrink-0 ml-2">
              View →
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Apiary Footer -->
    <div class="flex justify-between items-center pt-3 border-t border-gray-700">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-400">
          {{ apiary.installation_date ? `Created ${formatDate(apiary.installation_date)}` : 'Recently created' }}
        </span>
      </div>
      <span class="text-xs text-blue-400">View Details →</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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