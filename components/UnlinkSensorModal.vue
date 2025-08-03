<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-md">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-4">
          <svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold">Unlink Sensor from Hive</h3>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-300 mb-4">
            Are you sure you want to unlink the sensor <strong>"{{ sensorDisplayName }}"</strong> from this hive?
          </p>
          <p class="text-gray-300 mb-4">
            The sensor will be disconnected from this hive but will remain available to be assigned to another hive. The sensor and its historical data will not be deleted.
          </p>
          
          <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
            <p class="text-yellow-300 text-sm mb-2">
              To confirm unlinking, please type the sensor name below:
            </p>
            <p class="text-white font-mono text-sm mb-3 bg-gray-900 px-3 py-2 rounded">
              {{ confirmationText }}
            </p>
            <input
              v-model="confirmationInput"
              type="text"
              placeholder="Type sensor name to confirm"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              :class="{ 'border-yellow-500': confirmationInput && !isConfirmationValid }"
            />
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="handleClose" 
            class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer" 
            :disabled="unlinking"
          >
            Cancel
          </button>
          <button 
            @click="handleUnlink" 
            :disabled="!isConfirmationValid || unlinking" 
            class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg v-if="unlinking" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ unlinking ? 'Unlinking...' : 'Unlink Sensor' }}</span>
          </button>
        </div>
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
    type: Object,
    default: null
  },
  unlinking: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'unlink'])

// Reactive data
const confirmationInput = ref('')

// Computed properties
const sensorDisplayName = computed(() => {
  if (!props.sensor) return ''
  return props.sensor.name || `${formatSensorType(props.sensor.sensor_type)} Sensor`
})

const confirmationText = computed(() => {
  return sensorDisplayName.value
})

const isConfirmationValid = computed(() => {
  return confirmationInput.value.trim() === confirmationText.value
})

// Utility functions
const formatSensorType = (type) => {
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

// Methods
const handleUnlink = () => {
  if (!isConfirmationValid.value || props.unlinking) return
  emit('unlink', props.sensor)
}

const handleClose = () => {
  emit('close')
}

// Reset form when modal is shown/hidden
watch(() => props.show, (newShow) => {
  if (newShow) {
    confirmationInput.value = ''
  }
})
</script>

<style scoped>
/* Transition animations */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Loading spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>