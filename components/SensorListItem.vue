<template>
  <div 
    :class="containerClasses"
    @click="$emit('click', sensor)"
  >
    <div class="flex items-center space-x-2 flex-1 min-w-0">
      <!-- Sensor Type Icon -->
      <div class="flex-shrink-0">
        <svg v-if="sensor.sensor_type === 'temperature'" class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
        </svg>
        <svg v-else-if="sensor.sensor_type === 'humidity'" class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
        </svg>
        <svg v-else-if="sensor.sensor_type === 'weight'" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        <svg v-else class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      </div>
      
      <!-- Sensor Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2">
          <span :class="mode === 'card' ? 'text-xs' : 'text-sm'" class="font-medium truncate">
            {{ sensor.name || `${sensor.sensor_type} Sensor` }}
          </span>
          <div :class="['w-1.5 h-1.5 rounded-full', sensor.is_online ? 'bg-green-400' : 'bg-red-400']"></div>
        </div>
        <div :class="mode === 'card' ? 'text-xs' : 'text-sm'" class="text-gray-400">
          {{ sensorTypeLabel }}
        </div>
        
        <!-- Page Mode: Additional Details -->
        <div v-if="mode === 'page'" class="mt-1 space-y-1">
          <div v-if="sensor.model" class="text-xs text-gray-500">
            Model: {{ sensor.model }}
          </div>
          <div v-if="sensor.latest_reading?.signal_strength" class="text-xs text-gray-500">
            Signal: {{ sensor.latest_reading.signal_strength }}%
          </div>
        </div>
      </div>
    </div>
    
    <!-- Latest Reading -->
    <div class="text-right flex-shrink-0">
      <div v-if="sensor.latest_reading" class="text-xs font-medium">
        {{ formattedSensorValue }}
      </div>
      <div v-else class="text-xs text-gray-500">No data</div>
      <div class="text-xs text-gray-500">
        {{ sensor.latest_reading ? formatTime(sensor.latest_reading.reading_time) : 'Never' }}
      </div>
      
      <!-- Page Mode: Additional Info -->
      <div v-if="mode === 'page' && sensor.battery_level" class="text-xs mt-1" :class="batteryColor">
        Battery: {{ sensor.battery_level }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  sensor: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'page'].includes(value)
  }
})

// Events
const emit = defineEmits(['click'])

// Computed properties
const containerClasses = computed(() => {
  const baseClasses = 'flex items-center justify-between rounded-lg transition-colors cursor-pointer'
  
  if (props.mode === 'card') {
    return `${baseClasses} p-2 bg-gray-900 hover:bg-gray-750`
  } else {
    // Page mode - more padding, different background, additional styling
    return `${baseClasses} p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600`
  }
})

const sensorTypeLabel = computed(() => {
  const labels = {
    'temperature': 'Temperature',
    'humidity': 'Humidity', 
    'weight': 'Weight Scale',
    'activity': 'Activity'
  }
  return labels[props.sensor.sensor_type] || props.sensor.sensor_type.charAt(0).toUpperCase() + props.sensor.sensor_type.slice(1)
})

const formattedSensorValue = computed(() => {
  if (!props.sensor.latest_reading || props.sensor.latest_reading.value === null || props.sensor.latest_reading.value === undefined) {
    return 'N/A'
  }
  
  const value = parseFloat(props.sensor.latest_reading.value)
  const type = props.sensor.sensor_type
  const unit = props.sensor.latest_reading.unit
  
  switch (type) {
    case 'temperature':
      return `${value.toFixed(1)}°C`
    case 'humidity':
      return `${value.toFixed(1)}%`
    case 'weight':
      return `${(value / 1000).toFixed(1)}kg`
    default:
      return unit ? `${value.toFixed(1)}${unit}` : value.toFixed(1)
  }
})

const batteryColor = computed(() => {
  if (!props.sensor.battery_level) return 'text-gray-400'
  
  const level = props.sensor.battery_level
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
})

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

/* Sensor type icon colors */
.text-red-400 {
  color: #f87171;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-yellow-400 {
  color: #facc15;
}

.text-gray-400 {
  color: #9ca3af;
}

/* Online/offline status dots */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-red-400 {
  background-color: #f87171;
}
</style>