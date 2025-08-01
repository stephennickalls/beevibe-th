<template>
  <div class="min-h-screen bg-gray-900 text-white p-6">
    <!-- Header -->
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold mb-2">Apiaries</h1>
            <p class="text-gray-400">Manage your apiary locations and hive groups</p>
          </div>
          <button 
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Apiary</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Apiaries</p>
              <p class="text-2xl font-bold">{{ apiaries.length }}</p>
            </div>
            <div class="p-3 bg-blue-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Hives</p>
              <p class="text-2xl font-bold">{{ totalHives }}</p>
            </div>
            <div class="p-3 bg-green-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Active Apiaries</p>
              <p class="text-2xl font-bold">{{ activeApiaries }}</p>
            </div>
            <div class="p-3 bg-yellow-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Avg Hives/Apiary</p>
              <p class="text-2xl font-bold">{{ averageHivesPerApiary }}</p>
            </div>
            <div class="p-3 bg-purple-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <div>
            <h3 class="text-red-400 font-medium">Error Loading Apiaries</h3>
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>
        </div>
        <button 
          @click="loadApiaries" 
          class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="apiaries.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <h3 class="text-xl font-semibold mb-2">No Apiaries Yet</h3>
        <p class="text-gray-400 mb-6">Create your first apiary to start organizing your hives by location</p>
        <button 
          @click="showCreateModal = true"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Your First Apiary
        </button>
      </div>

      <!-- Apiaries Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="apiary in apiaries" 
          :key="apiary.id"
          class="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600"
        >
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold mb-1">{{ apiary.name }}</h3>
              <div class="flex items-center space-x-2">
                <div :class="apiary.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                <span class="text-sm" :class="apiary.is_active ? 'text-green-400' : 'text-gray-400'">
                  {{ apiary.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="editApiary(apiary)"
                class="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Edit apiary"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </button>
              <button 
                @click="deleteApiary(apiary)"
                class="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Delete apiary"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Description -->
          <p v-if="apiary.description" class="text-gray-300 text-sm mb-4">{{ apiary.description }}</p>

          <!-- Location Info -->
          <div class="space-y-2 mb-4">
            <div v-if="apiary.address" class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span class="text-sm text-gray-300">{{ apiary.address }}</span>
            </div>
            <div v-if="apiary.latitude && apiary.longitude" class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
              </svg>
              <span class="text-xs text-gray-400">
                {{ parseFloat(apiary.latitude).toFixed(4) }}, {{ parseFloat(apiary.longitude).toFixed(4) }}
              </span>
              <button 
                @click="openInMaps(apiary)"
                class="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                View on Map
              </button>
            </div>
          </div>

          <!-- Hive Count -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-700">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span class="text-sm text-gray-300">
                {{ apiary.hive_count || 0 }} {{ apiary.hive_count === 1 ? 'hive' : 'hives' }}
              </span>
            </div>
            <NuxtLink 
              :to="`/apiaries/${apiary.id}`"
              class="text-sm text-blue-400 hover:text-blue-300 no-underline"
            >
              View Details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Apiary Modal -->
    <CreateApiaryModal 
      :show="showCreateModal"
      @close="showCreateModal = false"
      @created="handleApiaryCreated"
    />

    <EditApiaryModal 
      :show="showEditModal"
      :apiary="selectedApiary"
      @close="closeEditModal"
      @updated="handleApiaryUpdated"
      @deleted="handleApiaryDeleted"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Delete Apiary</h3>
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete "{{ apiaryToDelete?.name }}"? 
          {{ apiaryToDelete?.hive_count > 0 ? `This apiary contains ${apiaryToDelete.hive_count} hive${apiaryToDelete.hive_count > 1 ? 's' : ''} that will be unassigned.` : '' }}
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Meta
definePageMeta({
  title: 'Apiaries',
  description: 'Manage your apiary locations and hive groups'
})

// State
const apiaries = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedApiary = ref(null)
const apiaryToDelete = ref(null)
const deleting = ref(false)

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Computed
const totalHives = computed(() => {
  return apiaries.value.reduce((total, apiary) => total + (apiary.hive_count || 0), 0)
})

const activeApiaries = computed(() => {
  return apiaries.value.filter(a => a.is_active).length
})

const averageHivesPerApiary = computed(() => {
  if (apiaries.value.length === 0) return 0
  return Math.round(totalHives.value / apiaries.value.length * 10) / 10
})

// Methods
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const loadApiaries = async () => {
  if (!user.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch('/api/apiaries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    apiaries.value = response.data || []
    
  } catch (err) {
    console.error('Error loading apiaries:', err)
    error.value = err.message || 'Failed to load apiaries'
  } finally {
    loading.value = false
  }
}

const editApiary = (apiary) => {
  selectedApiary.value = apiary
  showEditModal.value = true
}

const closeEditModal = () => {
  selectedApiary.value = null
  showEditModal.value = false
}

const deleteApiary = (apiary) => {
  apiaryToDelete.value = apiary
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!apiaryToDelete.value) return
  
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/apiaries/${apiaryToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Remove from local array
    apiaries.value = apiaries.value.filter(a => a.id !== apiaryToDelete.value.id)
    
    showDeleteModal.value = false
    apiaryToDelete.value = null
    
  } catch (err) {
    console.error('Error deleting apiary:', err)
    alert('Failed to delete apiary: ' + (err.message || 'Unknown error'))
  } finally {
    deleting.value = false
  }
}

const handleApiaryCreated = (newApiary) => {
  apiaries.value.push(newApiary)
  showCreateModal.value = false
}

const handleApiaryUpdated = (updatedApiary) => {
  const index = apiaries.value.findIndex(a => a.id === updatedApiary.id)
  if (index !== -1) {
    apiaries.value[index] = updatedApiary
  }
  closeEditModal()
}

const handleApiaryDeleted = (deletedApiaryId) => {
  apiaries.value = apiaries.value.filter(a => a.id !== deletedApiaryId)
  closeEditModal()
}

const openInMaps = (apiary) => {
  if (apiary.latitude && apiary.longitude) {
    const url = `https://www.google.com/maps?q=${apiary.latitude},${apiary.longitude}`
    window.open(url, '_blank')
  }
}

// Lifecycle
onMounted(() => {
  loadApiaries()
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    loadApiaries()
  } else {
    apiaries.value = []
  }
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>