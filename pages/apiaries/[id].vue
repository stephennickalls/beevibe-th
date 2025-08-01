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
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading apiary details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
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
              @click="showAddHiveModal = true"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
              <span>Add Hive</span>
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

        <!-- Apiary Information Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Basic Information -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
            <div class="space-y-3">
              <div v-if="apiary.description">
                <span class="text-sm text-gray-400">Description:</span>
                <p class="text-gray-200">{{ apiary.description }}</p>
              </div>
              <div v-if="apiary.installation_date">
                <span class="text-sm text-gray-400">Created:</span>
                <p class="text-gray-200">{{ formatDate(apiary.installation_date) }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Last Updated:</span>
                <p class="text-gray-200">{{ formatDate(apiary.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Location Information -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Location</h3>
            <div class="space-y-3">
              <div v-if="apiary.address">
                <span class="text-sm text-gray-400">Address:</span>
                <p class="text-gray-200">{{ apiary.address }}</p>
              </div>
              <div v-if="apiary.latitude && apiary.longitude">
                <span class="text-sm text-gray-400">Coordinates:</span>
                <p class="text-gray-200">
                  {{ parseFloat(apiary.latitude).toFixed(6) }}, {{ parseFloat(apiary.longitude).toFixed(6) }}
                </p>
              </div>
              <div v-if="apiary.latitude && apiary.longitude" class="pt-2">
                <button 
                  @click="showMapModal = true"
                  class="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  View on Map
                </button>
              </div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="bg-gray-800 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Statistics</h3>
            <div class="space-y-3">
              <div>
                <span class="text-sm text-gray-400">Total Hives:</span>
                <p class="text-2xl font-bold text-blue-400">{{ hives.length }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Active Hives:</span>
                <p class="text-lg text-green-400">{{ activeHiveCount }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-400">Total Sensors:</span>
                <p class="text-lg text-gray-200">{{ totalSensorCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hives Section -->
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">Hives ({{ hives.length }})</h3>
            <div class="flex items-center space-x-4">
              <button 
                @click="showAddHiveModal = true"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                </svg>
                <span>Add Hive</span>
              </button>
              <button 
                @click="showAssignHiveModal = true"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                </svg>
                <span>Assign Existing Hive</span>
              </button>
            </div>
          </div>

          <!-- No Hives State -->
          <div v-if="hives.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <h4 class="text-xl font-semibold mb-2">No Hives Yet</h4>
            <p class="text-gray-400 mb-6">This apiary doesn't have any hives assigned yet.</p>
            <div class="flex justify-center space-x-3">
              <button 
                @click="showAddHiveModal = true"
                class="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Create New Hive
              </button>
              <button 
                @click="showAssignHiveModal = true"
                class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Assign Existing Hive
              </button>
            </div>
          </div>

          <!-- Hives Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="hive in hives" 
              :key="hive.id"
              class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-700 hover:border-gray-600"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-medium text-lg truncate">{{ hive.name || `Hive ${hive.id}` }}</h4>
                  <p v-if="hive.description" class="text-xs text-gray-400 truncate">{{ hive.description }}</p>
                  <div class="flex items-center space-x-2 mt-1">
                    <div :class="hive.is_active ? 'bg-green-400' : 'bg-gray-400'" class="w-2 h-2 rounded-full"></div>
                    <span class="text-xs" :class="hive.is_active ? 'text-green-400' : 'text-gray-400'">
                      {{ hive.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                <div class="flex space-x-1">
                  <button 
                    @click="viewHive(hive)"
                    class="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="View hive details"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </button>
                  <button 
                    @click="removeHive(hive)"
                    class="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove from apiary"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-xs text-gray-400">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                  </svg>
                  <span>{{ formatDate(hive.installation_date || hive.created_at) }}</span>
                </div>
                <div v-if="hive.sensor_count" class="flex items-center space-x-2 text-xs text-gray-400">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z"/>
                  </svg>
                  <span>{{ hive.sensor_count }} sensors</span>
                </div>
              </div>
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
          {{ hives.length > 0 ? `This will unassign ${hives.length} hive${hives.length > 1 ? 's' : ''} from this apiary.` : '' }}
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

    <!-- Add Hive Modal -->
    <AddHiveModal
      :show="showAddHiveModal"
      :creating="addingHive"
      :subscription="subscription"
      :current-usage="currentUsage"
      :can-add="canAddHive"
      :upgrade-message="upgradeMessage"
      :pre-selected-apiary="apiary"
      @close="showAddHiveModal = false"
      @create="handleCreateHive"
    />

    <!-- Assign Existing Hive Modal -->
    <AssignHiveModal
      :show="showAssignHiveModal"
      :apiary="apiary"
      :available-hives="unassignedHives"
      :assigning="assigningHive"
      @close="showAssignHiveModal = false"
      @assign="handleAssignHive"
    />

    <!-- Remove Hive Confirmation Modal -->
    <div v-if="showRemoveHiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Remove Hive from Apiary</h3>
        <p class="text-gray-300 mb-4">
          Are you sure you want to remove "{{ hiveToRemove?.name }}" from this apiary? 
          The hive will become unassigned but will not be deleted.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showRemoveHiveModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button 
            @click="confirmRemoveHive"
            :disabled="removingHive"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ removingHive ? 'Removing...' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>

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
const hives = ref([])
const allHives = ref([])
const activeAlerts = ref([])

// Modal states
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddHiveModal = ref(false)
const showAssignHiveModal = ref(false)
const showRemoveHiveModal = ref(false)
const showMapModal = ref(false)

// Loading states
const deleting = ref(false)
const addingHive = ref(false)
const assigningHive = ref(false)
const removingHive = ref(false)

// Form data
const hiveToRemove = ref(null)

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { subscription, loadSubscription } = useSubscription()

// Computed properties
const activeHiveCount = computed(() => {
  return hives.value.filter(h => h.is_active).length
})

const totalSensorCount = computed(() => {
  return hives.value.reduce((total, hive) => total + (hive.sensor_count || 0), 0)
})

const unassignedHives = computed(() => {
  return allHives.value.filter(hive => !hive.apiary_id)
})

const currentUsage = computed(() => ({
  hives: allHives.value?.length || 0,
  sensors: 0 // Would need to fetch sensor count
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
  
  loading.value = true
  error.value = null
  
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
    hives.value = response.data.hives || []
    
  } catch (err) {
    console.error('Error loading apiary details:', err)
    error.value = err.message || 'Failed to load apiary details'
  } finally {
    loading.value = false
  }
}

const loadAllHives = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/hives', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.data) {
      allHives.value = response.data
    }
    
  } catch (err) {
    console.error('Error loading all hives:', err)
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

const handleCreateHive = async (hiveData) => {
  addingHive.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    // Include apiary_id in hive data
    const hiveWithApiary = {
      ...hiveData,
      apiary_id: apiary.value.id
    }

    const response = await $fetch('/api/hives', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: hiveWithApiary
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Add new hive to local list
    hives.value.push(response.data)
    showAddHiveModal.value = false
    
  } catch (err) {
    console.error('Error creating hive:', err)
    alert('Failed to create hive: ' + (err.message || 'Unknown error'))
  } finally {
    addingHive.value = false
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
        name: hiveToAssign.name, // Include the current name
        description: hiveToAssign.description,
        apiary_id: apiary.value.id,
        installation_date: hiveToAssign.installation_date,
        is_active: hiveToAssign.is_active
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Refresh the hives list
    await loadApiaryDetails()
    await loadAllHives()
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

const removeHive = (hive) => {
  hiveToRemove.value = hive
  showRemoveHiveModal.value = true
}

const confirmRemoveHive = async () => {
  if (!hiveToRemove.value) return
  
  removingHive.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hives/${hiveToRemove.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        name: hiveToRemove.value.name, // Include the current name
        description: hiveToRemove.value.description,
        apiary_id: null, // Remove from apiary
        installation_date: hiveToRemove.value.installation_date,
        is_active: hiveToRemove.value.is_active
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Remove from local list
    hives.value = hives.value.filter(h => h.id !== hiveToRemove.value.id)
    showRemoveHiveModal.value = false
    hiveToRemove.value = null
    
  } catch (err) {
    console.error('Error removing hive:', err)
    alert('Failed to remove hive: ' + (err.message || 'Unknown error'))
  } finally {
    removingHive.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadApiaryDetails(),
    loadAllHives(),
    loadSubscription()
  ])
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>