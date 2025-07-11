<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Edit Sensor Details</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <!-- Sensor Type (Editable) -->
        <div>
          <label class="block text-sm font-medium mb-2">Sensor Type</label>
          <select 
            v-model="formData.sensor_type" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 capitalize"
          >
            <option value="">Select type...</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="weight">Weight</option>
          </select>
        </div>
        
        <!-- Sensor Name (Editable) -->
        <div>
          <label class="block text-sm font-medium mb-2">Sensor Name</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="e.g., Main Temperature Sensor"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
          />
        </div>
        
        <!-- Model (Editable) -->
        <div>
          <label class="block text-sm font-medium mb-2">Model</label>
          <input 
            v-model="formData.model" 
            type="text" 
            placeholder="e.g., DHT22, DS18B20"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
          />
        </div>

        <!-- Hive Assignment (Editable) -->
        <div>
          <label class="block text-sm font-medium mb-2">Assigned Hive</label>
          <select 
            v-model="formData.hive_id" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Unassigned</option>
            <option v-for="hive in availableHives" :key="hive.id" :value="hive.id">
              {{ hive.name || `Hive ${hive.id}` }}
            </option>
          </select>
        </div>
        
        <!-- Battery Level (Editable) -->
        <div>
          <label class="block text-sm font-medium mb-2">Battery Level (%)</label>
          <input 
            v-model="formData.battery_level" 
            type="number" 
            min="0" 
            max="100"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
          />
        </div>
        
        <!-- Online Status (Editable) -->
        <div class="flex items-center space-x-2">
          <input 
            v-model="formData.is_online" 
            type="checkbox" 
            id="sensor_online" 
            class="rounded" 
          />
          <label for="sensor_online" class="text-sm">Sensor is online</label>
        </div>
        
        <!-- Read-only Info -->
        <div class="bg-gray-750 rounded-lg p-4 space-y-2">
          <h4 class="text-sm font-medium text-gray-300 mb-2">Sensor Information</h4>
          <div class="text-sm text-gray-400 space-y-1">
            <p><span class="text-gray-500">Created:</span> {{ formatDate(sensor?.created_at) }}</p>
            <p><span class="text-gray-500">Last Updated:</span> {{ formatDate(sensor?.updated_at) }}</p>
            <p><span class="text-gray-500">Last Reading:</span> {{ formatTime(sensor?.last_reading_at) || 'No readings yet' }}</p>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
        <button @click="$emit('close')" class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer" :disabled="updating">
          Cancel
        </button>
        <button 
          @click="handleSave" 
          :disabled="updating" 
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center space-x- cursor-pointer"
        >
          <svg v-if="updating" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ updating ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

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
  availableHives: {
    type: Array,
    default: () => []
  },
  updating: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Form data
const formData = ref({
  sensor_type: '',
  name: '',
  model: '',
  battery_level: 100,
  is_online: true,
  hive_id: ''
})

// Watch for sensor changes to populate form
watch(() => props.sensor, (newSensor) => {
  if (newSensor) {
    formData.value = {
      sensor_type: newSensor.sensor_type || '',
      name: newSensor.name || '',
      model: newSensor.model || '',
      battery_level: newSensor.battery_level || 100,
      is_online: newSensor.is_online !== undefined ? newSensor.is_online : true,
      hive_id: newSensor.hive_id || ''
    }
  }
}, { immediate: true })

// Utility functions
const formatTime = (date) => {
  if (!date) return 'No recent data'
  
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

const formatDate = (date) => {
  if (!date) return 'Not set'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Handle save
const handleSave = () => {
  emit('save', formData.value)
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
</style>