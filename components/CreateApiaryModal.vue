<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
    @click.self="$emit('close')"
  >
    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-lg font-semibold">Create New Apiary</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
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
      </div>

      <!-- Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
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
  show: Boolean
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
  return formData.value.name.trim().length >= 2 && Object.keys(errors.value).length === 0
})

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