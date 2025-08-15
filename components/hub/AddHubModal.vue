<!-- components/AddHubModal.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-white">Add New Hub</h3>
          <button @click="handleClose" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-3">
          <p class="text-red-300 text-sm">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="mb-4 bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-3">
          <p class="text-green-300 text-sm">{{ success }}</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">
                Hub Name <span class="text-red-400">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                :disabled="loading"
                placeholder="Enter hub name..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                :disabled="loading"
                placeholder="Enter description (optional)..."
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Assign to Apiary</label>
              <select
                v-model="form.apiary_id"
                :disabled="loading"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <option :value="null">Leave unassigned</option>
                <option v-for="apiary in apiaries" :key="apiary.id" :value="apiary.id">
                  {{ apiary.name }}
                </option>
              </select>
              <p v-if="apiaries.length === 0" class="text-xs text-gray-400 mt-1">
                No apiaries available. Create an apiary first to assign this hub.
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="handleClose"
              :disabled="loading"
              class="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!form.name?.trim() || loading"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 9a3 3 0 100-6 3 3 0 000 6z"/>
              </svg>
              <span>{{ loading ? 'Creating...' : 'Create Hub' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { useSupabaseClient } from '#imports'

const supabase = useSupabaseClient()

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  apiaries: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'success', 'error'])

// State
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  name: '',
  description: '',
  apiary_id: null
})

// Computed
const isFormValid = computed(() => {
  return form.value.name?.trim()
})

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    apiary_id: null
  }
  error.value = ''
  success.value = ''
}

const handleClose = () => {
  if (!loading.value) {
    resetForm()
    emit('close')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    console.log('🚀 Starting hub creation...')
    
    // Check if user is authenticated and get token
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Auth session check:', { hasSession: !!session, hasToken: !!session?.access_token })

    if (!session?.access_token) {
      throw new Error('You must be logged in to create a hub')
    }

    // Validate name length
    if (form.value.name.trim().length < 2) {
      throw new Error('Hub name must be at least 2 characters long')
    }

    if (form.value.name.trim().length > 100) {
      throw new Error('Hub name must be less than 100 characters')
    }

    const requestData = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      apiary_id: form.value.apiary_id || null
    }

    console.log('Making API request to /api/hubs with auth token...')
    console.log('Request data:', requestData)

    // Call the API endpoint to create the hub with auth header
    const response = await $fetch('/api/hubs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: requestData
    })

    console.log('✅ API Response received:', response)

    if (!response.success) {
      throw new Error(response.message || 'Failed to create hub')
    }

    success.value = 'Hub created successfully!'
    
    // Emit success with the created hub data
    emit('success', response.data)
    
    // Close modal after a brief delay to show success message
    setTimeout(() => {
      handleClose()
    }, 1500)

  } catch (err) {
    console.error('❌ Error creating hub:', err)
    
    // Handle different error types
    if (err.statusCode === 409) {
      error.value = 'A hub with this name already exists'
    } else if (err.statusCode === 400) {
      error.value = err.statusMessage || err.message || 'Please check your information and try again'
    } else if (err.statusCode === 401) {
      error.value = 'You must be logged in to create a hub'
    } else if (err.statusCode === 403) {
      error.value = 'Permission denied. You may have reached your hub limit.'
    } else if (err.statusCode === 500) {
      error.value = 'Server error. Please try again.'
    } else {
      error.value = err.message || err.toString() || 'Failed to create hub. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Watch for visibility changes to reset form
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    resetForm()
  }
})

// Handle escape key
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible && !loading.value) {
    handleClose()
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>