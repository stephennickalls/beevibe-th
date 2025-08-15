<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-md">
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Assign Sensor to Hive</h3>
        <button @click="handleClose" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <!-- No Unassigned Sensors State -->
      <div v-if="unassignedSensors.length === 0" class="p-6">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
          </svg>
          <h4 class="text-lg font-semibold mb-2">No Unassigned Sensors</h4>
          <p class="text-gray-400 mb-4">
            All sensors are currently assigned to hives. Create a new sensor first to assign it to this hive.
          </p>
          <div class="flex flex-col space-y-3">
            <NuxtLink 
              to="/sensors" 
              class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center"
              @click="handleClose"
            >
              Go to Sensors Page
            </NuxtLink>
            <button 
              @click="handleClose" 
              class="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Assign Sensor Form -->
      <div v-else>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Select Sensor to Assign</label>
            <select 
              v-model="selectedSensorId" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose an unassigned sensor...</option>
              <option v-for="sensor in unassignedSensors" :key="sensor.id" :value="sensor.id">
                {{ sensor.name || `${sensor.sensor_type} Sensor` }} ({{ sensor.sensor_type }})
              </option>
            </select>
          </div>

          <!-- Selected Sensor Details -->
          <div v-if="selectedSensorDetails" class="bg-gray-700 rounded-lg p-4">
            <h4 class="text-sm font-medium text-gray-300 mb-2">Sensor Details</h4>
            <div class="space-y-1 text-sm text-gray-400">
              <p><span class="text-gray-500">Type:</span> {{ selectedSensorDetails.sensor_type }}</p>
              <p><span class="text-gray-500">Model:</span> {{ selectedSensorDetails.model || 'Not specified' }}</p>
              <p><span class="text-gray-500">Battery:</span> {{ selectedSensorDetails.battery_level || 'Unknown' }}%</p>
              <p><span class="text-gray-500">Status:</span> 
                <span :class="selectedSensorDetails.is_online ? 'text-green-400' : 'text-red-400'">
                  {{ selectedSensorDetails.is_online ? 'Online' : 'Offline' }}
                </span>
              </p>
              <p><span class="text-gray-500">Created:</span> {{ formatDate(selectedSensorDetails.created_at) }}</p>
            </div>
          </div>

          <!-- Info Message -->
          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p class="text-blue-300 text-sm">
              <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
              Only unassigned sensors are shown. To create a new sensor, visit the 
              <NuxtLink to="/sensors" class="text-blue-400 hover:text-blue-300 underline">sensors page</NuxtLink>.
            </p>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button 
            @click="handleClose" 
            class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button 
            @click="handleAssign" 
            :disabled="!selectedSensorId || assigning" 
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
          >
            <svg v-if="assigning" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ assigning ? 'Assigning...' : 'Assign Sensor' }}</span>
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
  unassignedSensors: {
    type: Array,
    default: () => []
  },
  assigning: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'assign'])

// Reactive data
const selectedSensorId = ref('')

// Computed properties
const selectedSensorDetails = computed(() => {
  if (!selectedSensorId.value) return null
  return props.unassignedSensors.find(sensor => sensor.id === selectedSensorId.value)
})

// Utility functions
const formatDate = (date) => {
  if (!date) return 'Not set'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Methods
const handleAssign = () => {
  if (!selectedSensorId.value || props.assigning) return
  console.log('🔍 Modal: handleAssign called with selectedSensorId:', selectedSensorId.value)
  console.log('🔍 Modal: selectedSensorId type:', typeof selectedSensorId.value)
  console.log('🔍 Modal: props.assigning:', props.assigning)
  
  console.log('Modal: Emitting assign event for sensor ID:', selectedSensorId.value)
  emit('assign', selectedSensorId.value)
}

const handleClose = () => {
  console.log('Modal: Closing assign modal')
  emit('close')
}

// Reset form when modal is shown/hidden
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedSensorId.value = ''
    console.log('Modal: Assign modal opened')
  } else {
    console.log('Modal: Assign modal closed')
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