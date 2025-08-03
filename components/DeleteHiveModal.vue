<template>
  <!-- Modal Backdrop with highest z-index -->
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
    <!-- Modal Container -->
    <div class="bg-gray-800 rounded-lg w-full max-w-md shadow-2xl transform transition-all">
      <!-- Modal Content -->
      <div class="p-6">
        
        <!-- Header -->
        <div class="flex items-center space-x-3 mb-4">
          <svg class="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold text-white">Delete Hive</h3>
        </div>
        
        <!-- Warning Content -->
        <div class="mb-6">
          <p class="text-gray-300 mb-4">
            Are you sure you want to delete <strong>"{{ hiveDisplayName }}"</strong>?
          </p>
          <p class="text-gray-300 mb-4">
            This action cannot be undone and will remove all associated sensor data and historical records.
          </p>
          
          <!-- Confirmation Input -->
          <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p class="text-red-300 text-sm mb-2">
              To confirm deletion, please type the hive name below:
            </p>
            <p class="text-white font-mono text-sm mb-3 bg-gray-900 px-3 py-2 rounded">
              {{ confirmationText }}
            </p>
            <input
              v-model="confirmationInput"
              type="text"
              placeholder="Type hive name to confirm"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white placeholder-gray-400"
              :class="{ 'border-red-500': confirmationInput && !isConfirmationValid }"
            />
          </div>
          
          <!-- Sensor Warning (only show if hive has sensors) -->
          <div v-if="sensorCount > 0" class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              <div>
                <p class="text-yellow-200 text-sm font-medium">
                  This hive has {{ sensorCount }} sensor{{ sensorCount > 1 ? 's' : '' }} attached
                </p>
                <p class="text-yellow-300 text-xs mt-1">
                  Sensors will be unlinked but not deleted. You can reassign them to other hives later.
                </p>
              </div>
            </div>
          </div>

          <!-- Historical Data Warning (always show) -->
          <div class="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 mb-4">
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              <div>
                <p class="text-orange-200 text-sm font-medium">
                  All historical data will be permanently deleted
                </p>
                <p class="text-orange-300 text-xs mt-1">
                  This includes sensor readings, alerts, daily summaries, and inspection records.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button 
            @click="$emit('close')" 
            class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer transition-colors" 
            :disabled="deleting"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete" 
            :disabled="!isConfirmationValid || deleting" 
            class="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <svg v-if="deleting" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ deleting ? 'Deleting...' : 'Delete Hive' }}</span>
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
  hive: {
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
const hiveDisplayName = computed(() => {
  if (!props.hive) return ''
  return props.hive.name || `Hive ${props.hive.id}`
})

const confirmationText = computed(() => {
  return hiveDisplayName.value
})

const isConfirmationValid = computed(() => {
  return confirmationInput.value.trim() === confirmationText.value
})

// Get sensor count for display - handle different possible data structures
const sensorCount = computed(() => {
  if (!props.hive) return 0
  
  // Check if sensors is an array
  if (Array.isArray(props.hive.sensors)) {
    return props.hive.sensors.length
  }
  
  // Check if there's a sensor_count property
  if (typeof props.hive.sensor_count === 'number') {
    return props.hive.sensor_count
  }
  
  // Default to 0 if no sensors data
  return 0
})

// Methods
const handleDelete = () => {
  if (!isConfirmationValid.value || props.deleting) return
  emit('delete', props.hive)
}

// Reset form when modal is shown/hidden
watch(() => props.show, (newShow) => {
  if (newShow) {
    confirmationInput.value = ''
  }
})

// Prevent body scroll when modal is open
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
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

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Loading spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus styles */
input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

/* Ensure modal appears above everything */
.z-\[100\] {
  z-index: 100;
}
</style>