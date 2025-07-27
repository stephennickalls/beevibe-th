<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Sensor Details</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        <!-- Header with Status -->
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-2xl font-bold mb-1">{{ sensor?.name || `${formatSensorType(sensor?.sensor_type)} Sensor` }}</h4>
            <p class="text-gray-400 text-sm">{{ formatSensorType(sensor?.sensor_type) }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <div :class="['w-3 h-3 rounded-full', sensor?.is_online ? 'bg-green-400' : 'bg-red-400']"></div>
            <span :class="['font-medium', sensor?.is_online ? 'text-green-400' : 'text-red-400']">
              {{ sensor?.is_online ? 'Online' : 'Offline' }}
            </span>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Sensor ID</label>
              <p class="text-white">{{ sensor?.id }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">UUID</label>
              <div class="flex items-center space-x-2">
                <p class="text-white font-mono text-sm">
                  {{ showUuid ? sensor?.uuid : '••••••••-••••-••••-••••-••••••••••••' }}
                </p>
                <button 
                  @click="toggleUuid"
                  class="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  {{ showUuid ? 'Hide' : 'Show' }}
                </button>
                <button 
                  v-if="showUuid && sensor?.uuid"
                  @click="copyToClipboard(sensor.uuid)"
                  class="text-gray-400 hover:text-white p-1 rounded"
                  title="Copy UUID"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Model</label>
              <p class="text-white">{{ sensor?.model || 'Not specified' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Hive Assignment</label>
              <p class="text-white">
                {{ sensor?.hives?.name || 'Unassigned' }}
              </p>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div v-if="sensor?.battery_level">
              <label class="block text-sm font-medium text-gray-400 mb-1">Battery Level</label>
              <div class="flex items-center space-x-3">
                <div class="flex-1 bg-gray-600 rounded-full h-2">
                  <div 
                    :class="['h-2 rounded-full transition-all duration-300', getBatteryColor()]"
                    :style="{ width: `${sensor.battery_level}%` }"
                  ></div>
                </div>
                <span :class="['text-sm font-medium', getBatteryTextColor()]">
                  {{ sensor.battery_level }}%
                </span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Created</label>
              <p class="text-white">{{ formatDateTime(sensor?.created_at) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
              <p class="text-white">{{ formatDateTime(sensor?.updated_at) }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Last Reading</label>
              <p class="text-white">{{ formatTime(sensor?.last_reading_at) || 'No readings yet' }}</p>
            </div>
          </div>
        </div>

        <!-- Latest Reading Section -->
        <div v-if="sensor?.latest_reading" class="bg-gray-750 rounded-lg p-4">
          <h5 class="text-lg font-semibold mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Latest Reading
          </h5>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Value</label>
              <p class="text-xl font-bold text-white">{{ formatReadingValue(sensor.latest_reading) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Time</label>
              <p class="text-white">{{ formatTime(sensor.latest_reading.reading_time) }}</p>
            </div>
            <div v-if="sensor.latest_reading.signal_strength">
              <label class="block text-sm font-medium text-gray-400 mb-1">Signal Strength</label>
              <p class="text-white">{{ sensor.latest_reading.signal_strength }}%</p>
            </div>
          </div>
        </div>

        <!-- No Reading State -->
        <div v-else class="bg-gray-750 rounded-lg p-4 text-center">
          <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <p class="text-gray-400">No readings available yet</p>
          <p class="text-gray-500 text-sm mt-1">This sensor hasn't reported any data</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700 bg-gray-750">
        <div class="flex space-x-3">
          <button 
            @click="$emit('edit')" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            <span>Edit Sensor</span>
          </button>
          
          <button 
            @click="$emit('delete')" 
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 012 0v6a1 1 0 11-2 0V7zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V7z"/>
            </svg>
            <span>Delete Sensor</span>
          </button>
        </div>
        
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  sensor: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'edit', 'delete'])

// Reactive data
const showUuid = ref(false)

// Methods
const toggleUuid = () => {
  showUuid.value = !showUuid.value
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // You could show a toast notification here
    console.log('UUID copied to clipboard')
  } catch (err) {
    console.error('Failed to copy UUID:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Utility functions
const formatSensorType = (type) => {
  if (!type) return 'Unknown'
  const labels = {
    'temperature': 'Temperature',
    'humidity': 'Humidity', 
    'weight': 'Weight Scale',
    'sound': 'Sound Level',
    'vibration': 'Vibration',
    'activity': 'Activity'
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const formatTime = (date) => {
  if (!date) return null
  
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

const formatDateTime = (date) => {
  if (!date) return 'Not set'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatReadingValue = (reading) => {
  if (!reading || reading.value === null || reading.value === undefined) {
    return 'N/A'
  }
  
  const value = parseFloat(reading.value)
  const type = props.sensor?.sensor_type
  const unit = reading.unit
  
  switch (type) {
    case 'temperature':
      return `${value.toFixed(1)}°C`
    case 'humidity':
      return `${value.toFixed(1)}%`
    case 'weight':
      return `${(value / 1000).toFixed(1)}kg`
    default:
      return unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2)
  }
}

const getBatteryColor = () => {
  const level = props.sensor?.battery_level || 0
  if (level <= 20) return 'bg-red-500'
  if (level <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getBatteryTextColor = () => {
  const level = props.sensor?.battery_level || 0
  if (level <= 20) return 'text-red-400'
  if (level <= 50) return 'text-yellow-400'
  return 'text-green-400'
}
</script>

<style scoped>
/* Custom scrollbar for modal */
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Transition animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>