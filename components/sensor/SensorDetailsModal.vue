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
        <!-- Debug section - shows what we're actually receiving -->
        <!-- <div class="p-3 bg-red-900/20 border border-red-500/30 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Sensor object type: {{ typeof sensor }}</p>
          <p>Is null: {{ sensor === null }}</p>
          <p>Is PointerEvent: {{ sensor?.constructor?.name === 'PointerEvent' }}</p>
          <p v-if="sensor && sensor.constructor?.name !== 'PointerEvent'">Sensor ID: {{ sensor.id }}</p>
          <p v-if="sensor && sensor.constructor?.name !== 'PointerEvent'">Sensor Type: {{ sensor.sensor_type }}</p>
          <p v-if="sensor && sensor.constructor?.name !== 'PointerEvent'">All Keys: {{ Object.keys(sensor).join(', ') }}</p>
        </div> -->

        <!-- Only show content if we have a valid sensor object -->
        <div v-if="isValidSensor">
          <!-- Header with Status -->
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-2xl font-bold mb-1">
                {{ sensor.name || `${formatSensorType(sensor.sensor_type)} Sensor` }}
              </h4>
              <p class="text-gray-400 text-sm">{{ formatSensorType(sensor.sensor_type) }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <div :class="['w-3 h-3 rounded-full', sensor.is_online ? 'bg-green-400' : 'bg-red-400']"></div>
              <span :class="['font-medium', sensor.is_online ? 'text-green-400' : 'text-red-400']">
                {{ sensor.is_online ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Sensor ID</label>
                <p class="text-white">{{ sensor.id || 'Not available' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">UUID</label>
                <div class="flex items-center space-x-2">
                  <p class="text-white font-mono text-sm">
                    {{ showUuid ? (sensor.uuid || 'Not available') : '••••••••-••••-••••-••••-••••••••••••' }}
                  </p>
                  <button 
                    @click="toggleUuid"
                    class="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    {{ showUuid ? 'Hide' : 'Show' }}
                  </button>
                  <button 
                    v-if="showUuid && sensor.uuid"
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
                <label class="block text-sm font-medium text-gray-400 mb-1">Sensor Type</label>
                <p class="text-white">{{ formatSensorType(sensor.sensor_type) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Model</label>
                <p class="text-white">{{ sensor.model || 'Not specified' }}</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Hive Assignment</label>
                <p class="text-white">{{ getHiveAssignment(sensor) }}</p>
              </div>

              <div v-if="sensor.battery_level !== undefined && sensor.battery_level !== null">
                <label class="block text-sm font-medium text-gray-400 mb-1">Battery Level</label>
                <div class="flex items-center space-x-3">
                  <div class="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      :class="['h-2 rounded-full transition-all duration-300', getBatteryColor(sensor.battery_level)]"
                      :style="{ width: `${sensor.battery_level}%` }"
                    ></div>
                  </div>
                  <span :class="['text-sm font-medium', getBatteryTextColor(sensor.battery_level)]">
                    {{ sensor.battery_level }}%
                  </span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Created</label>
                <p class="text-white">{{ formatDateTime(sensor.created_at) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Last Updated</label>
                <p class="text-white">{{ formatDateTime(sensor.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error state when sensor is invalid -->
        <div v-else class="text-center py-8">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2 text-red-400">Invalid Sensor Data</h3>
          <p class="text-gray-400">The sensor data could not be loaded properly.</p>
          <p class="text-gray-500 text-sm mt-1">Please check the console for debugging information.</p>
        </div>
      </div>
      
      <!-- Action Buttons - only show if we have valid sensor -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700 bg-gray-700">
        <div class="flex space-x-3">
          <button 
            v-if="isValidSensor"
            @click="handleEdit" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            <span>Edit Sensor</span>
          </button>
          
          <button 
            v-if="isValidSensor"
            @click="handleDelete" 
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
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  sensor: {
    type: [Object, null],
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'edit', 'delete'])

// Reactive data
const showUuid = ref(false)

// Watch for sensor changes and log for debugging
watch(() => props.sensor, (newSensor) => {
  console.log('SensorDetailsModal received sensor:', newSensor)
  console.log('Sensor type:', typeof newSensor)
  console.log('Is PointerEvent:', newSensor?.constructor?.name === 'PointerEvent')
  if (newSensor && newSensor.constructor?.name !== 'PointerEvent') {
    console.log('Valid sensor keys:', Object.keys(newSensor))
    console.log('Sensor data:', JSON.stringify(newSensor, null, 2))
  }
}, { immediate: true })

// Check if we have a valid sensor object (not a PointerEvent)
const isValidSensor = computed(() => {
  console.log('isValidSensor check:', {
    sensor: props.sensor,
    type: typeof props.sensor,
    constructor: props.sensor?.constructor?.name,
    hasId: props.sensor?.id !== undefined,
    id: props.sensor?.id
  })
  
  return props.sensor && 
         typeof props.sensor === 'object' && 
         props.sensor.constructor?.name !== 'PointerEvent' &&
         props.sensor.id !== undefined
})

// Methods
const toggleUuid = () => {
  showUuid.value = !showUuid.value
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    console.log('UUID copied to clipboard')
  } catch (err) {
    console.error('Failed to copy UUID:', err)
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const handleEdit = () => {
  console.log('Edit button clicked, emitting sensor:', props.sensor)
  emit('edit', props.sensor)
}

const handleDelete = () => {
  console.log('Delete button clicked, emitting sensor:', props.sensor)
  emit('delete', props.sensor)
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

const getHiveAssignment = (sensor) => {
  if (!sensor) return 'Unknown'
  
  // Check different possible hive reference structures
  if (sensor.hives?.name) return sensor.hives.name
  if (sensor.hive?.name) return sensor.hive.name
  if (sensor.hive_name) return sensor.hive_name
  if (sensor.hive_id) return `Hive ID: ${sensor.hive_id}`
  
  return 'Unassigned'
}

const getBatteryColor = (level) => {
  if (level <= 20) return 'bg-red-500'
  if (level <= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getBatteryTextColor = (level) => {
  if (level <= 20) return 'text-red-400'
  if (level <= 50) return 'text-yellow-400'
  return 'text-green-400'
}

const formatDateTime = (date) => {
  if (!date) return 'Not set'
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
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

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>