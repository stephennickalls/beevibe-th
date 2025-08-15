<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      
      <!-- 🔄 DYNAMIC HEADER BASED ON MODE -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-lg font-semibold">
          {{ canAdd ? 'Create New Apiary' : 'Upgrade Required' }}
        </h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
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
              <span>Apiaries:</span>
              <span class="font-medium text-red-400">
                {{ currentUsage?.apiaries || 0 }}/{{ subscription?.limits?.max_apiaries === -1 ? '∞' : subscription?.limits?.max_apiaries }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Hives:</span>
              <span class="font-medium">
                {{ currentUsage?.hives || 0 }}/{{ subscription?.limits?.max_hives === -1 ? '∞' : subscription?.limits?.max_hives }}
              </span>
            </div>
            <div class="flex justify-between">
              <span>Hubs:</span>
              <span class="font-medium">
                {{ currentUsage?.hubs || 0 }}/{{ subscription?.limits?.max_hubs === -1 ? '∞' : subscription?.limits?.max_hubs }}
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

      <!-- ✅ FORM MODE: When user can add apiaries -->
      <div v-else class="flex-1 overflow-y-auto p-6 space-y-4">
        
        <!-- Apiary Name -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Apiary Name <span class="text-red-400">*</span>
          </label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="Enter apiary name..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            :class="errors.name ? 'border-red-500' : ''"
          />
          <p v-if="errors.name" class="text-red-400 text-sm mt-1">{{ errors.name }}</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea 
            v-model="formData.description" 
            rows="3"
            placeholder="Optional description of your apiary..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          ></textarea>
        </div>

        <!-- Address -->
        <div>
          <label class="block text-sm font-medium mb-2">Address</label>
          <input 
            v-model="formData.address" 
            type="text" 
            placeholder="Enter full address..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p class="text-sm text-gray-400 mt-1">
            Helpful for identifying the apiary location
          </p>
        </div>

        <!-- GPS Coordinates -->
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

        <!-- Get Current Location Button -->
        <div class="flex justify-center">
          <button 
            @click="getCurrentLocation"
            :disabled="gettingLocation"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {{ gettingLocation ? 'Getting Location...' : '📍 Use Current Location' }}
          </button>
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
            id="apiary_active" 
            class="rounded" 
          />
          <label for="apiary_active" class="text-sm">Apiary is active</label>
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
              <span class="text-gray-500">Apiaries:</span> 
              <span class="font-medium" :class="getApiaryUsageClass()">
                {{ currentUsage?.apiaries || 0 }}/{{ subscription.limits.max_apiaries === -1 ? '∞' : subscription.limits.max_apiaries }}
              </span>
            </p>
            <p>
              <span class="text-gray-500">Hives:</span> 
              <span class="font-medium">
                {{ currentUsage?.hives || 0 }}/{{ subscription.limits.max_hives === -1 ? '∞' : subscription.limits.max_hives }}
              </span>
            </p>
            <p>
              <span class="text-gray-500">Hubs:</span> 
              <span class="font-medium">
                {{ currentUsage?.hubs || 0 }}/{{ subscription.limits.max_hubs === -1 ? '∞' : subscription.limits.max_hubs }}
              </span>
            </p>
          </div>
          
          <!-- Usage Progress Bar for Apiaries -->
          <div v-if="subscription.limits.max_apiaries !== -1" class="mt-3">
            <div class="flex justify-between text-xs mb-1" :class="getUsageTextClass()">
              <span>Apiary Usage</span>
              <span>{{ Math.round(apiaryUsagePercent) }}%</span>
            </div>
            <div class="w-full bg-gray-600 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-300" 
                :class="getProgressBarClass()"
                :style="{ width: `${Math.min(apiaryUsagePercent, 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="canAdd" class="flex justify-end space-x-3 p-6 border-t border-gray-700">
        <button 
          @click="$emit('close')"
          class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleCreate"
          :disabled="!isValid || creating"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ creating ? 'Creating...' : 'Create Apiary' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  subscription: {
    type: Object,
    default: null
  },
  currentUsage: {
    type: Object,
    default: () => ({ apiaries: 0, hives: 0, hubs: 0 })
  },
  canAdd: {
    type: Boolean,
    default: true
  },
  upgradeMessage: {
    type: String,
    default: 'You have reached your apiary limit for your current plan.'
  }
})

const emit = defineEmits(['close', 'created'])

// State
const formData = ref({
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  installation_date: '',
  is_active: true
})

const errors = ref({})
const creating = ref(false)
const gettingLocation = ref(false)
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Computed
const isValid = computed(() => {
  return formData.value.name.trim().length >= 2 && 
         Object.keys(errors.value).length === 0 &&
         props.canAdd
})

const apiaryUsagePercent = computed(() => {
  if (!props.subscription || props.subscription.limits.max_apiaries === -1) return 0
  return ((props.currentUsage?.apiaries || 0) / props.subscription.limits.max_apiaries) * 100
})

const isNearLimit = computed(() => apiaryUsagePercent.value >= 80 && apiaryUsagePercent.value < 100)
const isAtLimit = computed(() => apiaryUsagePercent.value >= 100)

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

const getApiaryUsageClass = () => {
  if (isAtLimit.value) return 'text-red-400'
  if (isNearLimit.value) return 'text-yellow-400'
  return 'text-green-400'
}

const getProgressBarClass = () => {
  if (isAtLimit.value) return 'bg-red-500'
  if (isNearLimit.value) return 'bg-yellow-500'
  return 'bg-green-500'
}

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Apiary name is required'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Apiary name must be at least 2 characters'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Apiary name must be less than 100 characters'
  }
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.')
    return
  }

  gettingLocation.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      formData.value.latitude = position.coords.latitude.toString()
      formData.value.longitude = position.coords.longitude.toString()
      gettingLocation.value = false
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('Unable to get your location. Please enter coordinates manually.')
      gettingLocation.value = false
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const handleCreate = async () => {
  // 🔥 PROTECTED CREATE HANDLER
  if (!props.canAdd) {
    console.warn('Attempted to create apiary while at subscription limit')
    return
  }

  validateForm()
  
  if (!isValid.value) return
  
  creating.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const apiaryData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || null,
      address: formData.value.address.trim() || null,
      latitude: formData.value.latitude ? parseFloat(formData.value.latitude) : null,
      longitude: formData.value.longitude ? parseFloat(formData.value.longitude) : null,
      installation_date: formData.value.installation_date || null,
      is_active: formData.value.is_active
    }

    const response = await $fetch('/api/apiaries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: apiaryData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    emit('created', response.data)
    
  } catch (err) {
    console.error('Error creating apiary:', err)
    alert('Failed to create apiary. Please try again.')
  } finally {
    creating.value = false
  }
}

// Watchers
watch(() => formData.value.name, validateForm)

watch(() => props.show, (newShow) => {
  if (newShow) {
    formData.value = {
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      installation_date: '',
      is_active: true
    }
    errors.value = {}
  }
})
</script>

<style scoped>
/* Link styling */
.no-underline {
  text-decoration: none;
}

.no-underline:hover {
  text-decoration: none;
}

/* Transition animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>