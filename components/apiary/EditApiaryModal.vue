<!-- components/EditApiaryModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Edit Apiary</h3>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-white"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="updateError" class="m-6 mb-0 bg-red-900/20 border border-red-400/30 rounded-lg p-4">
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <div>
            <h4 class="text-red-400 font-medium">Update Failed</h4>
            <p class="text-red-300 text-sm mt-1">{{ updateError }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="p-6 space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Apiary Name <span class="text-red-400">*</span>
          </label>
          <input 
            v-model="formData.name" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            :class="errors.name ? 'border-red-400' : 'border-gray-600'"
            placeholder="Enter apiary name"
            maxlength="100"
          />
          <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
        </div>
        
        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea 
            v-model="formData.description" 
            rows="3" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Optional description"
            maxlength="500"
          ></textarea>
        </div>
        
        <!-- Address -->
        <div>
          <label class="block text-sm font-medium mb-2">Address</label>
          <input 
            v-model="formData.address" 
            type="text" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Street address (optional)"
          />
        </div>
        
        <!-- GPS Coordinates -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">Latitude</label>
            <input 
              v-model="formData.latitude" 
              type="number" 
              step="any"
              class="w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              :class="errors.coordinates ? 'border-red-400' : 'border-gray-600'"
              placeholder="0.000000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Longitude</label>
            <input 
              v-model="formData.longitude" 
              type="number" 
              step="any"
              class="w-full px-3 py-2 bg-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              :class="errors.coordinates ? 'border-red-400' : 'border-gray-600'"
              placeholder="0.000000"
            />
          </div>
        </div>
        <p v-if="errors.coordinates" class="text-red-400 text-xs">{{ errors.coordinates }}</p>
        
        <div>
          <button 
            @click="getCurrentLocation"
            :disabled="gettingLocation"
            class="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
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
            id="apiary_active_edit" 
            class="rounded" 
          />
          <label for="apiary_active_edit" class="text-sm">Apiary is active</label>
        </div>

        <!-- Current Status Info -->
        <div v-if="apiary" class="bg-gray-900 rounded-lg p-4">
          <h4 class="text-sm font-medium mb-2">Current Status</h4>
          <div class="text-sm text-gray-300 space-y-1">
            <p>
              <span class="text-gray-400">Hives assigned:</span> 
              {{ apiary.hive_count || 0 }}
            </p>
            <p v-if="apiary.uuid" class="text-xs">
              <span class="text-gray-400">Apiary ID:</span> 
              <code class="bg-gray-800 px-1 rounded">{{ apiary.uuid }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700">
        <button 
          @click="handleDelete"
          :disabled="updating || deleting"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ deleting ? 'Deleting...' : 'Delete' }}
        </button>
        <div class="flex space-x-3">
          <button 
            @click="$emit('close')"
            :disabled="updating"
            class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="handleUpdate"
            :disabled="!isValid || updating"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ updating ? 'Updating...' : 'Update Apiary' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  apiary: Object
})

const emit = defineEmits(['close', 'updated', 'deleted'])

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
const updateError = ref('')
const updating = ref(false)
const deleting = ref(false)
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
  updateError.value = ''
  
  // Name validation
  if (!formData.value.name.trim()) {
    errors.value.name = 'Apiary name is required'
  } else if (formData.value.name.trim().length < 2) {
    errors.value.name = 'Apiary name must be at least 2 characters'
  } else if (formData.value.name.trim().length > 100) {
    errors.value.name = 'Apiary name must be less than 100 characters'
  }

  // GPS coordinates validation
  const lat = formData.value.latitude
  const lng = formData.value.longitude
  
  if ((lat && !lng) || (!lat && lng)) {
    errors.value.coordinates = 'Both latitude and longitude are required if using GPS coordinates'
  } else if (lat && lng) {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errors.value.coordinates = 'Latitude must be between -90 and 90'
    } else if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.value.coordinates = 'Longitude must be between -180 and 180'
    }
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
      validateForm() // Revalidate after getting location
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

const getDetailedErrorMessage = (error) => {
  // Handle different types of errors
  if (error.message) {
    return error.message
  }
  
  if (error.data?.message) {
    return error.data.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  // Handle HTTP status codes
  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid apiary data provided. Please check all fields.'
      case 401:
        return 'You are not authorized to perform this action. Please log in again.'
      case 403:
        return 'You do not have permission to edit this apiary.'
      case 404:
        return 'This apiary could not be found. It may have been deleted.'
      case 409:
        return 'An apiary with this name already exists.'
      case 422:
        return 'The apiary data is invalid. Please check all required fields.'
      case 500:
        return 'A server error occurred. Please try again in a few moments.'
      default:
        return `Server error (${error.statusCode}). Please try again.`
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}

const handleUpdate = async () => {
  validateForm()
  
  if (!isValid.value || !props.apiary) return
  
  updating.value = true
  updateError.value = ''
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available. Please log in again.')
    }

    const updateData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || null,
      address: formData.value.address.trim() || null,
      latitude: formData.value.latitude ? parseFloat(formData.value.latitude) : null,
      longitude: formData.value.longitude ? parseFloat(formData.value.longitude) : null,
      installation_date: formData.value.installation_date || null,
      is_active: formData.value.is_active
    }

    console.log('Updating apiary with data:', updateData)

    const response = await $fetch(`/api/apiaries/${props.apiary.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: updateData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    console.log('Update successful:', response.data)
    emit('updated', response.data)
    
  } catch (err) {
    console.error('Error updating apiary:', err)
    updateError.value = getDetailedErrorMessage(err)
  } finally {
    updating.value = false
  }
}

const handleDelete = async () => {
  if (!props.apiary) return
  
  const confirmMessage = props.apiary.hive_count > 0 
    ? `Are you sure you want to delete "${props.apiary.name}"? This apiary contains ${props.apiary.hive_count} hive${props.apiary.hive_count > 1 ? 's' : ''} that will be unassigned.`
    : `Are you sure you want to delete "${props.apiary.name}"?`
  
  if (!confirm(confirmMessage)) return
  
  deleting.value = true
  updateError.value = ''
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available. Please log in again.')
    }

    const response = await $fetch(`/api/apiaries/${props.apiary.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    emit('deleted', props.apiary.id)
    
  } catch (err) {
    console.error('Error deleting apiary:', err)
    updateError.value = getDetailedErrorMessage(err)
  } finally {
    deleting.value = false
  }
}

// Watchers
watch(() => formData.value.name, validateForm)
watch(() => formData.value.latitude, validateForm)
watch(() => formData.value.longitude, validateForm)

watch(() => props.apiary, (newApiary) => {
  if (newApiary) {
    formData.value = {
      name: newApiary.name || '',
      description: newApiary.description || '',
      address: newApiary.address || '',
      latitude: newApiary.latitude?.toString() || '',
      longitude: newApiary.longitude?.toString() || '',
      installation_date: newApiary.installation_date || '',
      is_active: newApiary.is_active !== undefined ? newApiary.is_active : true
    }
    errors.value = {}
    updateError.value = ''
  }
}, { immediate: true })

watch(() => props.show, (newShow) => {
  if (!newShow) {
    errors.value = {}
    updateError.value = ''
  }
})
</script>