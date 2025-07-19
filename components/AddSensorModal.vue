<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Add New Sensor</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>
      
      <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        <!-- Sensor Type -->
        <div>
          <label class="block text-sm font-medium mb-2">Sensor Type *</label>
          <select 
            v-model="formData.sensor_type" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 capitalize"
            :class="{ 'border-red-500': errors.sensor_type }"
          >
            <option value="">Select sensor type...</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="weight">Weight</option>
          </select>
          <p v-if="errors.sensor_type" class="text-red-400 text-xs mt-1">{{ errors.sensor_type }}</p>
        </div>
        
        <!-- Sensor Name -->
        <div>
          <label class="block text-sm font-medium mb-2">Sensor Name *</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="e.g., Main Temperature Sensor"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
            :class="{ 'border-red-500': errors.name }"
          />
          <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
        </div>
        
        <!-- Model -->
        <div>
          <label class="block text-sm font-medium mb-2">Model</label>
          <input 
            v-model="formData.model" 
            type="text" 
            placeholder="e.g., DHT22, DS18B20, BME280"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
          />
          <p class="text-gray-400 text-xs mt-1">Optional: Enter the specific model number or type</p>
        </div>

        <!-- Hive Assignment -->
        <div>
          <label class="block text-sm font-medium mb-2">Assign to Hive</label>
          <select 
            v-model="formData.hive_id" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Leave unassigned</option>
            <option v-for="hive in availableHives" :key="hive.id" :value="hive.id">
              {{ hive.name || `Hive ${hive.id}` }}
            </option>
          </select>
          <p class="text-gray-400 text-xs mt-1">You can assign the sensor to a hive later if needed</p>
        </div>
        
        <!-- Battery Level -->
        <div>
          <label class="block text-sm font-medium mb-2">Battery Level (%)</label>
          <input 
            v-model="formData.battery_level" 
            type="number" 
            min="0" 
            max="100"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>Current: {{ formData.battery_level }}%</span>
            <span>100%</span>
          </div>
        </div>
        
        <!-- Online Status -->
        <div class="flex items-center space-x-2">
          <input 
            v-model="formData.is_online" 
            type="checkbox" 
            id="sensor_online" 
            class="rounded" 
          />
          <label for="sensor_online" class="text-sm">Sensor is online and active</label>
        </div>

        <!-- Info about limits -->
        <div v-if="subscription" class="bg-gray-750 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-300 mb-2">Plan Information</h4>
          <div class="text-xs text-gray-400 space-y-1">
            <p><span class="text-gray-500">Current Plan:</span> {{ subscription.planDisplayName }}</p>
            <p>
              <span class="text-gray-500">Sensors:</span> 
              <span :class="currentUsage?.sensors >= subscription.limits.max_sensors_total && subscription.limits.max_sensors_total !== -1 ? 'text-red-400' : 'text-gray-300'">
                {{ currentUsage?.sensors || 0 }}/{{ subscription.limits.max_sensors_total === -1 ? '∞' : subscription.limits.max_sensors_total }}
              </span>
            </p>
            <p v-if="subscription.limits.max_sensors_per_hive !== -1">
              <span class="text-gray-500">Per Hive Limit:</span> 
              <span class="text-gray-300">{{ subscription.limits.max_sensors_per_hive }} sensors/hive</span>
            </p>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer" 
          :disabled="creating"
        >
          Cancel
        </button>
        <button 
          @click="handleCreate" 
          :disabled="!isValid || creating" 
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <svg v-if="creating" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ creating ? 'Creating...' : 'Create Sensor' }}</span>
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
  creating: {
    type: Boolean,
    default: false
  },
  availableHives: {
    type: Array,
    default: () => []
  },
  subscription: {
    type: Object,
    default: null
  },
  currentUsage: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'create'])

// Form data
const formData = ref({
  sensor_type: '',
  name: '',
  model: '',
  battery_level: 100,
  is_online: true,
  hive_id: ''
})

// Validation errors
const errors = ref({})

// Computed properties
const isValid = computed(() => {
  return formData.value.sensor_type && 
         formData.value.name.trim().length > 0 && 
         Object.keys(errors.value).length === 0
})

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.sensor_type) {
    errors.value.sensor_type = 'Sensor type is required'
  }
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Sensor name is required'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Sensor name must be at least 2 characters'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Sensor name must be less than 100 characters'
  }
}

// Auto-generate name based on sensor type
watch(() => formData.value.sensor_type, (newType) => {
  if (newType && !formData.value.name.trim()) {
    formData.value.name = `${newType.charAt(0).toUpperCase() + newType.slice(1)} Sensor`
  }
  validateForm()
})

// Watch for form changes to validate
watch(() => formData.value.name, validateForm)

// Reset form when modal is shown
watch(() => props.show, (newShow) => {
  if (newShow) {
    formData.value = {
      sensor_type: '',
      name: '',
      model: '',
      battery_level: 100,
      is_online: true,
      hive_id: ''
    }
    errors.value = {}
  }
})

// Handle create
const handleCreate = () => {
  validateForm()
  
  if (isValid.value) {
    const sensorData = {
      sensor_type: formData.value.sensor_type,
      name: formData.value.name.trim(),
      model: formData.value.model.trim() || null,
      battery_level: parseInt(formData.value.battery_level),
      is_online: formData.value.is_online,
      hive_id: formData.value.hive_id || null
    }
    
    emit('create', sensorData)
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
</style>