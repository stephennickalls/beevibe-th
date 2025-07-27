<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold text-red-400">Delete Sensor</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <p class="text-gray-300 mb-4">
          This action cannot be undone. This will permanently delete the sensor and all its data.
        </p>
        
        <div class="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 class="font-semibold mb-2">Sensor to Delete:</h4>
          <p class="text-sm text-gray-300">{{ sensorDisplayName }}</p>
          <div v-if="sensor?.sensor_type" class="text-xs text-gray-400 mt-1">
            Type: {{ formatSensorType(sensor.sensor_type) }}
          </div>
          <div v-if="sensor?.hives?.name" class="text-xs text-gray-400 mt-1">
            Assigned to: {{ sensor.hives.name }}
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">
            Type <span class="font-bold text-red-400">{{ confirmationText }}</span> to confirm:
          </label>
          <input 
            v-model="confirmationInput" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            :placeholder="confirmationText"
            autocomplete="off"
          />
          <div v-if="confirmationInput && !isConfirmationValid" class="text-red-400 text-xs mt-1">
            Please type "{{ confirmationText }}" exactly to confirm deletion
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete" 
            :disabled="!isConfirmationValid || deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center space-x-2"
          >
            <svg v-if="deleting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ deleting ? 'Deleting...' : 'Delete Sensor' }}</span>
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
  deleting: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'delete'])

// Reactive data
const confirmationInput = ref('')

// Computed properties
const sensorDisplayName = computed(() => {
  if (!props.sensor) return ''
  return props.sensor.name || `${formatSensorType(props.sensor.sensor_type)} Sensor`
})

const confirmationText = computed(() => {
  return props.sensor?.name || 'DELETE'
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
const handleDelete = () => {
  if (!isConfirmationValid.value || props.deleting) return
  emit('delete', props.sensor)
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