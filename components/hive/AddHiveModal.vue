<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
      
      <!-- 🔄 DYNAMIC HEADER BASED ON MODE -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">
          {{ canAdd ? 'Add New Hive' : 'Upgrade Required' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>

      <!-- 🔄 CONDITIONAL CONTENT BASED ON SUBSCRIPTION STATUS -->
      
      <!-- ❌ UPGRADE MODE: When at subscription limit -->
      <div v-if="!canAdd" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
            </svg>
          </div>
          <p class="text-gray-300 mb-4">{{ upgradeMessage }}</p>
        </div>
        
        <!-- Subscription info card -->
        <div class="bg-gray-700 rounded-lg p-4 mb-6">
          <h4 class="font-semibold mb-2">Your Current Plan: {{ subscription?.planDisplayName }}</h4>
          <div class="space-y-1 text-sm text-gray-300">
            <div class="flex justify-between">
              <span>Hives:</span>
              <span class="font-medium text-red-400">
                {{ currentUsage?.hives || 0 }}/{{ subscription?.limits?.max_hives === -1 ? '∞' : subscription?.limits?.max_hives }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Sensors:</span>
              <span class="font-medium">
                {{ currentUsage?.sensors || 0 }}/{{ subscription?.limits?.max_sensors_total === -1 ? '∞' : subscription?.limits?.max_sensors_total }}
              </span>
            </div>
          </div>
        </div>

        <!-- Upgrade action buttons -->
        <div class="flex space-x-4">
          <button 
            @click="$emit('close')"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Maybe Later
          </button>
          <NuxtLink 
            to="/pricing"
            class="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors no-underline"
            @click="$emit('close')"
          >
            View Plans
          </NuxtLink>
        </div>
      </div>

      <!-- ✅ FORM MODE: When user can add hives -->
      <div v-else>
        <!-- Form Content -->
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <!-- Hive Name -->
          <div>
            <label class="block text-sm font-medium mb-2">Hive Name *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="e.g., Backyard Hive 1"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
          </div>
          
          <!-- Description -->
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea 
              v-model="formData.description" 
              rows="3"
              placeholder="Optional description of your hive..."
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Latitude</label>
              <input 
                v-model="formData.latitude" 
                type="number" 
                step="any"
                placeholder="e.g., 40.7128"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Longitude</label>
              <input 
                v-model="formData.longitude" 
                type="number" 
                step="any"
                placeholder="e.g., -74.0060"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
              />
            </div>
          </div>
          
          <!-- Installation Date -->
          <div>
            <label class="block text-sm font-medium mb-2">Installation Date</label>
            <input 
              v-model="formData.installation_date" 
              type="date" 
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500" 
            />
          </div>
          
          <!-- Active Status -->
          <div class="flex items-center space-x-2">
            <input 
              v-model="formData.is_active" 
              type="checkbox" 
              id="hive_active" 
              class="rounded" 
            />
            <label for="hive_active" class="text-sm">Hive is active</label>
          </div>

          <!-- 📊 SUBSCRIPTION STATUS INFO -->
          <div v-if="subscription" class="bg-gray-750 rounded-lg p-4 border" :class="getUsageStatusClass()">
            <h4 class="text-sm font-medium mb-2" :class="getUsageTextClass()">
              📋 Plan Information
            </h4>
            <div class="text-xs space-y-1" :class="getUsageTextClass()">
              <p>
                <span class="text-gray-500">Current Plan:</span> 
                <span class="font-medium">{{ subscription.planDisplayName }}</span>
              </p>
              <p>
                <span class="text-gray-500">Hives:</span> 
                <span class="font-medium" :class="getHiveUsageClass()">
                  {{ currentUsage?.hives || 0 }}/{{ subscription.limits.max_hives === -1 ? '∞' : subscription.limits.max_hives }}
                </span>
              </p>
              <p v-if="subscription.limits.max_sensors_total !== -1">
                <span class="text-gray-500">Sensors:</span> 
                <span class="font-medium">
                  {{ currentUsage?.sensors || 0 }}/{{ subscription.limits.max_sensors_total === -1 ? '∞' : subscription.limits.max_sensors_total }}
                </span>
              </p>
            </div>
            
            <!-- Usage Progress Bar for Hives -->
            <div v-if="subscription.limits.max_hives !== -1" class="mt-3">
              <div class="flex justify-between text-xs mb-1" :class="getUsageTextClass()">
                <span>Hive Usage</span>
                <span>{{ Math.round(hiveUsagePercent) }}%</span>
              </div>
              <div class="w-full bg-gray-600 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300" 
                  :class="getProgressBarClass()"
                  :style="{ width: `${Math.min(hiveUsagePercent, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Form Footer Buttons -->
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
            <span>{{ creating ? 'Creating...' : 'Create Hive' }}</span>
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
  creating: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: Object,
    default: null
  },
  currentUsage: {
    type: Object,
    default: () => ({ hives: 0, sensors: 0 })
  },
  canAdd: {
    type: Boolean,
    default: true
  },
  // New prop to pass upgrade message from parent
  upgradeMessage: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'create'])

// Form data
const formData = ref({
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  installation_date: '',
  is_active: true
})

// Validation errors
const errors = ref({})

// 🔥 SIMPLIFIED SUBSCRIPTION LOGIC
const canAdd = computed(() => props.canAdd)

const hiveUsagePercent = computed(() => {
  if (!props.subscription || props.subscription.limits.max_hives === -1) return 0
  return ((props.currentUsage?.hives || 0) / props.subscription.limits.max_hives) * 100
})

const isNearLimit = computed(() => hiveUsagePercent.value >= 80 && hiveUsagePercent.value < 100)
const isAtLimit = computed(() => hiveUsagePercent.value >= 100)

// 🎨 STYLING METHODS
const getUsageStatusClass = () => {
  if (isAtLimit.value) return 'border-red-500/30 bg-red-900/20'
  if (isNearLimit.value) return 'border-yellow-500/30 bg-yellow-900/20'
  return 'border-gray-600'
}

const getUsageTextClass = () => {
  if (isAtLimit.value) return 'text-red-300'
  if (isNearLimit.value) return 'text-yellow-300'
  return 'text-gray-300'
}

const getHiveUsageClass = () => {
  if (isAtLimit.value) return 'text-red-400'
  if (isNearLimit.value) return 'text-yellow-400'
  return 'text-green-400'
}

const getProgressBarClass = () => {
  if (isAtLimit.value) return 'bg-red-500'
  if (isNearLimit.value) return 'bg-yellow-500'
  return 'bg-green-500'
}

// Form validation
const isValid = computed(() => {
  return formData.value.name.trim().length > 0 && 
         Object.keys(errors.value).length === 0 &&
         canAdd.value
})

// Validation function
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Hive name is required'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Hive name must be at least 2 characters'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Hive name must be less than 100 characters'
  }
}

// Watch for form changes
watch(() => formData.value.name, validateForm)

// Reset form when modal is shown
watch(() => props.show, (newShow) => {
  if (newShow) {
    formData.value = {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      installation_date: '',
      is_active: true
    }
    errors.value = {}
  }
})

// 🔥 PROTECTED CREATE HANDLER
const handleCreate = () => {
  if (!canAdd.value) {
    console.warn('Attempted to create hive while at subscription limit')
    return
  }
  
  validateForm()
  
  if (isValid.value) {
    const hiveData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || null,
      latitude: formData.value.latitude ? parseFloat(formData.value.latitude) : null,
      longitude: formData.value.longitude ? parseFloat(formData.value.longitude) : null,
      installation_date: formData.value.installation_date || null,
      is_active: formData.value.is_active
    }
    
    emit('create', hiveData)
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

/* Transition animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Link styling */
.no-underline {
  text-decoration: none;
}

.no-underline:hover {
  text-decoration: none;
}
</style>