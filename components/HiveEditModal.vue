<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
      
      <!-- Header -->
      <div class="flex justify-between items-center p-6 border-b border-gray-700">
        <h3 class="text-xl font-semibold">Edit Hive</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
          </svg>
        </button>
      </div>

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
            placeholder="Optional description of this hive..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          ></textarea>
          <p class="text-xs text-gray-400 mt-1">Optional - describe the hive location, characteristics, etc.</p>
        </div>

        <!-- Apiary Selection -->
        <div>
          <label class="block text-sm font-medium mb-2">Apiary</label>
          <select 
            v-model="formData.apiary_id" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">No apiary (unassigned)</option>
            <option v-for="apiary in availableApiaries" :key="apiary.id" :value="apiary.id">
              {{ apiary.name }}
              <span v-if="apiary.address"> - {{ apiary.address }}</span>
            </option>
          </select>
          <p class="text-xs text-gray-400 mt-1">
            Apiaries provide location information for your hives. 
            <button 
              @click="showCreateApiary = true" 
              class="text-blue-400 hover:text-blue-300 underline"
              type="button"
            >
              Create new apiary
            </button>
          </p>
        </div>

        <!-- Current Location Info (if apiary is selected) -->
        <div v-if="selectedApiaryInfo" class="bg-gray-900 rounded-lg p-3">
          <h5 class="text-sm font-medium mb-2">Current Location</h5>
          <div class="text-xs text-gray-400 space-y-1">
            <p><span class="font-medium">Apiary:</span> {{ selectedApiaryInfo.name }}</p>
            <p v-if="selectedApiaryInfo.address"><span class="font-medium">Address:</span> {{ selectedApiaryInfo.address }}</p>
            <p v-if="selectedApiaryInfo.latitude && selectedApiaryInfo.longitude">
              <span class="font-medium">Coordinates:</span> 
              {{ parseFloat(selectedApiaryInfo.latitude).toFixed(4) }}, {{ parseFloat(selectedApiaryInfo.longitude).toFixed(4) }}
            </p>
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
          <p class="text-xs text-gray-400 mt-1">When was this hive first installed?</p>
        </div>

        <!-- Active Status -->
        <div class="flex items-center space-x-3">
          <input 
            v-model="formData.is_active" 
            type="checkbox" 
            id="is_active" 
            class="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
          />
          <label for="is_active" class="text-sm">
            <span class="font-medium">Active Hive</span>
            <span class="block text-xs text-gray-400">Uncheck to mark this hive as inactive (not currently in use)</span>
          </label>
        </div>

        <!-- Hive UUID (Read-only) -->
        <div v-if="hive?.uuid">
          <label class="block text-sm font-medium mb-2">Hive ID</label>
          <div class="flex">
            <input 
              :value="hive.uuid" 
              type="text" 
              readonly 
              class="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-l-lg text-gray-400 cursor-not-allowed"
            />
            <button 
              @click="copyToClipboard(hive.uuid, 'Hive ID')" 
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-r-lg transition-colors text-sm"
              title="Copy to clipboard"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1">Unique identifier for this hive (read-only)</p>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="flex justify-between items-center p-6 border-t border-gray-700">
        <button 
          @click="$emit('delete', hive)" 
          class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Delete Hive
        </button>
        <div class="flex space-x-3">
          <button @click="$emit('close')" class="px-4 py-2 text-gray-400 hover:text-white cursor-pointer" :disabled="updating">
            Cancel
          </button>
          <button 
            @click="handleSave" 
            :disabled="!isValid || updating" 
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
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

    <!-- Create Apiary Modal -->
    <CreateApiaryModal 
      :show="showCreateApiary"
      @close="showCreateApiary = false"
      @created="handleApiaryCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

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
  updating: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'save', 'delete'])

// Form data
const formData = ref({
  name: '',
  description: '',
  apiary_id: '',
  installation_date: '',
  is_active: true
})

// State
const errors = ref({})
const availableApiaries = ref([])
const showCreateApiary = ref(false)
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Computed properties
const isValid = computed(() => {
  return formData.value.name.trim().length > 0 && 
         Object.keys(errors.value).length === 0
})

const selectedApiaryInfo = computed(() => {
  if (!formData.value.apiary_id) return null
  return availableApiaries.value.find(a => a.id == formData.value.apiary_id)
})

// Functions
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

const fetchApiaries = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/apiaries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.data) {
      availableApiaries.value = response.data
    }
  } catch (err) {
    console.error('Error fetching apiaries:', err)
  }
}

const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const handleSave = () => {
  validateForm()
  
  if (isValid.value) {
    const updateData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || null,
      apiary_id: formData.value.apiary_id || null,
      installation_date: formData.value.installation_date || null,
      is_active: formData.value.is_active
    }
    
    emit('save', updateData)
  }
}

const handleApiaryCreated = (newApiary) => {
  availableApiaries.value.push(newApiary)
  formData.value.apiary_id = newApiary.id
  showCreateApiary.value = false
}

// Watch for form changes
watch(() => formData.value.name, validateForm)

// Watch for hive changes and populate form
watch(() => props.hive, (newHive) => {
  if (newHive) {
    formData.value = {
      name: newHive.name || '',
      description: newHive.description || '',
      apiary_id: newHive.apiary_id || '',
      installation_date: newHive.installation_date || '',
      is_active: newHive.is_active !== undefined ? newHive.is_active : true
    }
    errors.value = {}
  }
}, { immediate: true })

// Reset form when modal is closed
watch(() => props.show, (newShow) => {
  if (!newShow) {
    errors.value = {}
  } else {
    fetchApiaries()
  }
})

// Lifecycle
onMounted(() => {
  if (props.show) {
    fetchApiaries()
  }
})
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

/* Loading spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>