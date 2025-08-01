<template>
  <div 
    @click="$emit('click', hive)"
    class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600 relative"
  >
    <!-- Hive Header -->
    <div class="flex justify-between items-start mb-3">
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-lg truncate">{{ hive.name || `Hive ${hive.id}` }}</h3>
        <p v-if="hive.description" class="text-xs text-gray-400 truncate">
          {{ hive.description }}
        </p>
        <p v-else class="text-xs text-gray-400">No description</p>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <div :class="hiveStatus.color" class="w-2 h-2 rounded-full"></div>
        <span class="text-xs" :class="hiveStatus.textColor">{{ hiveStatus.status }}</span>
      </div>
    </div>

    <!-- Detailed Sensors List -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-medium text-gray-300">Sensors</h4>
        <span class="text-xs text-gray-400">{{ hive.sensor_count || 0 }} total</span>
      </div>
      
      <!-- No Sensors State -->
      <div v-if="!hive.sensors || hive.sensors.length === 0" class="text-center py-6 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        <p class="text-xs text-gray-500">No sensors installed</p>
        <p class="text-xs text-gray-600 mt-1">Click to add sensors</p>
      </div>
      
      <!-- Sensors List -->
      <div v-else class="space-y-2 max-h-40 overflow-y-auto">
        <SensorListItem
          v-for="sensor in hive.sensors"
          :key="sensor.id"
          :sensor="sensor"
          @click="$emit('sensor-click', sensor, hive)"
        />
      </div>
    </div>

    <!-- Hive Footer -->
    <div class="flex justify-between items-center pt-3 border-t border-gray-700">
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-400">
          Updated {{ formatTime(hive.last_sensor_reading || hive.updated_at) }}
        </span>
        <div v-if="hive.online_sensor_count > 0" class="flex items-center space-x-1">
          <div class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
          <span class="text-xs text-green-400">{{ hive.online_sensor_count }}/{{ hive.sensor_count }} online</span>
        </div>
      </div>
      <span class="text-xs text-blue-400">View Hive Details →</span>
    </div>

    <!-- Battery Warning Indicator -->
    <!-- <div v-if="hasLowBatterySensors" class="absolute top-2 right-2">
      <div class="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center" title="Low battery sensors">
        <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
        </svg>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SensorListItem from './SensorListItem.vue'

// Props
const props = defineProps({
  hive: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click', 'sensor-click'])

// Computed properties
const hiveStatus = computed(() => {
  const temp = props.hive.temperature
  const humidity = props.hive.humidity
  
  if (!temp || !humidity) {
    return { status: 'No Data', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  if (temp < 30 || temp > 40 || humidity < 45 || humidity > 75) {
    return { status: 'Alert', color: 'bg-red-400', textColor: 'text-red-400' }
  } else if (temp < 32 || temp > 38 || humidity < 50 || humidity > 70) {
    return { status: 'Warning', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
  } else {
    return { status: 'Healthy', color: 'bg-green-400', textColor: 'text-green-400' }
  }
})

// const hasLowBatterySensors = computed(() => {
//   return props.hive.sensors?.some(sensor => sensor.battery_level < 20) || false
// })

// Helper functions
const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}
</script>

<style scoped>
/* Sensor cards overflow */
.max-h-40::-webkit-scrollbar {
  width: 4px;
}

.max-h-40::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-40::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Hover effects */
.hover\:bg-gray-750:hover {
  background-color: rgba(55, 65, 81, 0.9);
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Status indicator colors */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-yellow-400 {
  background-color: #facc15;
}

.bg-red-400 {
  background-color: #f87171;
}

.bg-gray-400 {
  background-color: #9ca3af;
}

.text-green-400 {
  color: #4ade80;
}

.text-yellow-400 {
  color: #facc15;
}

.text-red-400 {
  color: #f87171;
}

.text-gray-400 {
  color: #9ca3af;
}

.text-blue-400 {
  color: #60a5fa;
}
</style>