<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading apiary details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Apiary Not Found</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <NuxtLink to="/apiaries" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Back to Apiaries
          </NuxtLink>
        </div>
      </div>

      <!-- Apiary Content -->
      <div v-else-if="apiary">
        <!-- Header with breadcrumb and actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div class="mb-4 sm:mb-0">
            <nav class="flex text-sm text-gray-400 mb-2">
              <NuxtLink to="/apiaries" class="hover:text-white transition-colors">Apiaries</NuxtLink>
              <span class="mx-2">→</span>
              <span>{{ apiary.name }}</span>
            </nav>
            <h1 class="text-3xl font-bold">{{ apiary.name }}</h1>
            <div class="flex items-center space-x-4 mt-2">
              <div class="flex items-center space-x-2">
                <div :class="apiary.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-3 h-3 rounded-full"></div>
                <span class="text-sm" :class="apiary.is_active ? 'text-green-400' : 'text-gray-400'">
                  {{ apiary.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div v-if="apiary.uuid" class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">ID:</span>
                <code class="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">{{ apiary.uuid }}</code>
                <button 
                  @click="copyToClipboard(apiary.uuid, 'Apiary ID')"
                  class="text-xs text-blue-400 hover:text-blue-300"
                  title="Copy UUID"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0L9 10.172V13a1 1 0 102 0v-.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3">
            <button 
              @click="showEditModal = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <span>Edit Apiary</span>
            </button>
            <button 
              @click="showDeleteModal = true"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Basic Information Strip (Full Width) -->
        <div class="bg-gray-800 rounded-lg p-4 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <!-- Basic Info -->
            <div>
              <span class="text-sm text-gray-400">Description:</span>
              <p class="text-gray-200">{{ apiary.description || 'No description' }}</p>
            </div>
            
            <!-- Created Date -->
            <div>
              <span class="text-sm text-gray-400">Created:</span>
              <p class="text-gray-200">{{ formatDate(apiary.installation_date) }}</p>
            </div>
            
            <!-- Last Updated -->
            <div>
              <span class="text-sm text-gray-400">Last Updated:</span>
              <p class="text-gray-200">{{ formatDate(apiary.updated_at) }}</p>
            </div>
            
            <!-- Hive Count -->
            <div>
              <span class="text-sm text-gray-400">Total Hives:</span>
              <p class="text-2xl font-bold text-blue-400">{{ apiaryHives.length }}</p>
            </div>
          </div>
        </div>

        <!-- Hives Section -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">Hives ({{ apiaryHives.length }})</h3>
            <div class="flex items-center space-x-4">
              <button 
                @click="showAssignHiveModal = true"
                class="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                </svg>
                <span>Assign Existing Hive</span>
              </button>
              
              <button 
                @click="showUnassignHiveModal = true"
                :disabled="apiaryHives.length === 0"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
                <span>Unassign Hive</span>
              </button>
            </div>
          </div>

          <!-- No Hives State -->
          <div v-if="apiaryHives.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <h4 class="text-xl font-semibold mb-2">No Hives Yet</h4>
            <p class="text-gray-400 mb-6">This apiary doesn't have any hives assigned yet.</p>
            <div class="flex justify-center space-x-3">
              <button 
                @click="showAssignHiveModal = true"
                class="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg transition-colors"
              >
                Assign Existing Hive
              </button>
            </div>
          </div>

          <!-- Hives Grid using HiveCard Component without Remove Buttons -->
          <div v-else class="space-y-4">
            <div 
              v-for="hive in apiaryHives"
              :key="hive.id"
              class="cursor-pointer"
              @click="viewHive(hive)"
            >
              <HiveCard :hive="hive" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Apiary Modal -->
    <EditApiaryModal 
      :show="showEditModal"
      :apiary="apiary"
      @close="showEditModal = false"
      @updated="handleApiaryUpdated"
      @deleted="handleApiaryDeleted"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Delete Apiary</h3>
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete "{{ apiary?.name }}"? 
          {{ apiaryHives.length > 0 ? `This will unassign ${apiaryHives.length} hive${apiaryHives.length > 1 ? 's' : ''} from this apiary.` : '' }}
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

    <!-- Assign Existing Hive Modal -->
    <AssignHiveModal
      :show="showAssignHiveModal"
      :apiary="apiary"
      :available-hives="unassignedHives"
      :assigning="assigningHive"
      @close="showAssignHiveModal = false"
      @assign="handleAssignHive"
    />

    <!-- Unassign Hive Modal Component -->
    <UnassignHiveModal
      ref="unassignHiveModalRef"
      :show="showUnassignHiveModal"
      :hives="apiaryHives"
      @close="showUnassignHiveModal = false"
      @unassign="handleUnassignHive"
    />

    <!-- Map Modal Placeholder -->
    <div v-if="showMapModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Apiary Location</h3>
          <button 
            @click="showMapModal = false"
            class="text-gray-400 hover:text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="h-96 bg-gray-700 rounded-lg flex items-center justify-center">
          <p class="text-gray-400">Leaflet map will be implemented here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HiveCard from '~/components/HiveCard.vue'

// Route and navigation
const route = useRoute()
const apiaryId = route.params.id

// Meta
definePageMeta({
  title: 'Apiary Details - BeeVibe Dashboard',
  middleware: ['auth']
})

// Reactive data
const loading = ref(true)
const error = ref(null)
const apiary = ref({})
const activeAlerts = ref([])

// Modal states
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAssignHiveModal = ref(false)
const showUnassignHiveModal = ref(false)
const showMapModal = ref(false)

// Modal refs
const unassignHiveModalRef = ref(null)

// Loading states
const deleting = ref(false)
const assigningHive = ref(false)
const removingHive = ref(false)

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { subscription, loadSubscription } = useSubscription()

// Use the centralized hive data composable for sensor data
const {
  hivesWithSensorData,
  refreshData: refreshHiveData
} = useHiveData()

// Computed properties
const apiaryHives = computed(() => {
  if (!apiary.value?.id || !hivesWithSensorData.value) return []
  return hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.value.id)
})

const unassignedHives = computed(() => {
  if (!hivesWithSensorData.value) return []
  return hivesWithSensorData.value.filter(hive => !hive.apiary_id)
})

const currentUsage = computed(() => ({
  hives: hivesWithSensorData.value?.length || 0,
  sensors: 0
}))

const canAddHive = computed(() => {
  if (!subscription.value) return false
  const maxHives = subscription.value.limits?.max_hives
  return maxHives === -1 || (currentUsage.value.hives < maxHives)
})

const upgradeMessage = computed(() => {
  if (!subscription.value) return ''
  return `You've reached the hive limit for your ${subscription.value.planDisplayName} plan.`
})

// Helper functions
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
  }
}

// Data loading functions
const loadApiaryDetails = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/apiaries/${apiaryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    apiary.value = response.data
    
  } catch (err) {
    console.error('Error loading apiary details:', err)
    error.value = err.message || 'Failed to load apiary details'
  }
}

// Action handlers
const handleApiaryUpdated = (updatedApiary) => {
  apiary.value = { ...apiary.value, ...updatedApiary }
  showEditModal.value = false
}

const handleApiaryDeleted = () => {
  navigateTo('/apiaries')
}

const confirmDelete = async () => {
  if (!apiary.value) return
  
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/apiaries/${apiary.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    navigateTo('/apiaries')
    
  } catch (err) {
    console.error('Error deleting apiary:', err)
    alert('Failed to delete apiary: ' + (err.message || 'Unknown error'))
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

const handleAssignHive = async (hiveId) => {
  assigningHive.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    // Find the hive data to get its current name
    const hiveToAssign = unassignedHives.value.find(h => h.id === hiveId)
    if (!hiveToAssign) {
      throw new Error('Hive not found')
    }

    const response = await $fetch(`/api/hives/${hiveId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: hiveToAssign.name,
        description: hiveToAssign.description,
        apiary_id: apiary.value.id,
        installation_date: hiveToAssign.installation_date,
        is_active: hiveToAssign.is_active
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Refresh hive data to get updated assignments
    await refreshHiveData()
    showAssignHiveModal.value = false
    
  } catch (err) {
    console.error('Error assigning hive:', err)
    alert('Failed to assign hive: ' + (err.message || 'Unknown error'))
  } finally {
    assigningHive.value = false
  }
}

const viewHive = (hive) => {
  navigateTo(`/hives/${hive.id}`)
}

const confirmRemoveHive = async (hive) => {
  if (!hive) return
  
  removingHive.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hives/${hive.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: hive.name,
        description: hive.description,
        apiary_id: null, // Remove from apiary
        installation_date: hive.installation_date,
        is_active: hive.is_active
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Refresh hive data to get updated assignments
    await refreshHiveData()
    showRemoveHiveModal.value = false
    
  } catch (err) {
    console.error('Error removing hive:', err)
    alert('Failed to remove hive: ' + (err.message || 'Unknown error'))
  } finally {
    removingHive.value = false
  }
}

// Lifecycle - SIMPLIFIED to avoid loading issues
onMounted(async () => {
  try {
    await Promise.all([
      loadApiaryDetails(),
      refreshHiveData(), // Load hive data with sensors
      loadSubscription?.() || Promise.resolve()
    ])
  } catch (err) {
    console.error('Error during mount:', err)
    if (!error.value) {
      error.value = 'Failed to load page'
    }
  } finally {
    // ALWAYS set loading to false
    loading.value = false
  }
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>