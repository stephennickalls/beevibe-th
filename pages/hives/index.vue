<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold">Hives</h1>
          <p class="text-gray-400 mt-1">Manage all your beehives</p>
        </div>
        <div class="flex space-x-3">
          <button @click="showAddHiveModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Hive</span>
          </button>
          <button @click="refreshData" :disabled="loading" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Compact Filters Section -->
      <div class="bg-gray-900 rounded-lg mb-6">
        <!-- Filter Header -->
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-4">
            <button 
              @click="showFilters = !showFilters"
              class="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"/>
              </svg>
              <span>{{ showFilters ? 'Hide' : 'Show' }} Filters</span>
              <svg 
                class="w-4 h-4 transition-transform duration-200" 
                :class="{ 'rotate-180': showFilters }" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>
            
            <div class="text-sm text-gray-400">
              {{ filteredHives.length }} of {{ hivesWithSensorData.length }} hives
            </div>
          </div>
          
          <div v-if="hasActiveFilters" class="flex items-center space-x-2">
            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }}
            </span>
            <button @click="clearFilters" class="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
              Clear all
            </button>
          </div>
        </div>

        <!-- Expandable Filters -->
        <div v-if="showFilters" class="border-t border-gray-700 p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <!-- Search -->
            <div>
              <label class="block text-sm font-medium mb-1">Search</label>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Name or description..."
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <div class="relative">
                <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Sensor Count Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Sensor Count</label>
              <div class="relative">
                <select v-model="filterSensorCount" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Counts</option>
                  <option value="none">No Sensors</option>
                  <option value="low">1-2 Sensors</option>
                  <option value="medium">3-5 Sensors</option>
                  <option value="high">6+ Sensors</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Health Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Health Status</label>
              <div class="relative">
                <select v-model="filterHealth" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Health</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                  <option value="nodata">No Data</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Additional Filters Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Installation Date Range -->
            <div>
              <label class="block text-sm font-medium mb-1">Installation Date</label>
              <div class="relative">
                <select v-model="filterInstallDate" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Dates</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex items-end space-x-2">
              <button 
                @click="clearFilters"
                class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button 
                class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors cursor-pointer opacity-50"
                disabled
                title="Feature coming soon"
              >
                Save Preset
              </button>
            </div>
            
            <button 
              @click="showFilters = false"
              class="text-gray-400 hover:text-gray-300 text-sm cursor-pointer self-end"
            >
              Hide Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading hives...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Error Loading Hives</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button @click="refreshData" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      </div>

      <!-- No Hives State -->
      <div v-else-if="filteredHives.length === 0" class="text-center py-12">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto mb-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div v-if="!hasActiveFilters" class="text-4xl mb-2">🏠</div>
        </div>
        <h3 class="text-lg font-semibold mb-2">
          {{ hasActiveFilters ? 'No Hives Match Your Filters' : 'Ready to Add Your First Hive?' }}
        </h3>
        <p class="text-gray-400 mb-4">
          {{ hasActiveFilters ? 'Try adjusting your filters to find the hives you\'re looking for.' : 'Start your beekeeping journey by adding your first hive to monitor.' }}
        </p>
        <div class="flex justify-center space-x-3">
          <button v-if="hasActiveFilters" @click="clearFilters" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Clear Filters
          </button>
          <button v-else @click="showAddHiveModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Add First Hive
          </button>
        </div>
      </div>

      <!-- Hives Grid with HiveCard Component -->
      <div v-else class="space-y-3">
        <HiveCard
          v-for="hive in filteredHives"
          :key="hive.id"
          :hive="hive"
          @click="openHiveDetailModal"
        />
      </div>

      <!-- Add Hive Modal -->
      <AddHiveModal
        :show="showAddHiveModal"
        :creating="addingHive"
        :subscription="subscription"
        :current-usage="currentUsage"
        :can-add="canAddHive"
        :upgrade-message="upgradeMessage"
        @close="closeAddHiveModal"
        @create="handleCreateHive"
      />

      <!-- Hive Details Modal (the main details view) -->
      <HiveDetailsModal
        :show="showHiveDetailsModal"
        :hive="selectedHive"
        @close="closeHiveDetailsModal"
        @edit="handleEditFromDetails"
        @delete="handleDeleteFromDetails"
      />

      <!-- Hive Edit Modal (opens when edit is clicked from details) -->
      <HiveEditModal
        v-if="selectedHive"
        :show="showHiveDetailModal"
        :hive="selectedHive"
        :updating="updatingHive"
        @close="closeHiveDetailModal"
        @save="handleUpdateHive"
        @delete="openDeleteHiveModal"
      />

      <!-- Delete Hive Modal -->
      <DeleteHiveModal
        :show="showDeleteHiveModal"
        :hive="hiveToDelete"
        :deleting="deletingHive"
        @close="closeDeleteHiveModal"
        @delete="handleDeleteHive"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import HiveCard from '~/components/HiveCard.vue'
import AddHiveModal from '~/components/AddHiveModal.vue'
import HiveEditModal from '~/components/HiveEditModal.vue'
import DeleteHiveModal from '~/components/DeleteHiveModal.vue'
import HiveDetailsModal from '~/components/HiveDetailsModal.vue'

// Meta
definePageMeta({
  title: 'Hives - BeeVibe Dashboard',
  middleware: ['auth']
})

// Get user from Supabase auth
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Use our centralized data composable
const {
  hivesWithSensorData,
  sensorsWithLatestReadings,
  loading,
  error,
  refreshData,
  clearError
} = useHiveData()

// Helper function to get auth token (same pattern as sensors page)
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// Modal data
const showAddHiveModal = ref(false)
const showHiveDetailsModal = ref(false)  // Main details modal
const showHiveDetailModal = ref(false)   // Edit modal (keeping original name for compatibility)
const showDeleteHiveModal = ref(false)
const selectedHive = ref(null)
const hiveToDelete = ref(null)

// Loading states
const addingHive = ref(false)
const updatingHive = ref(false)
const deletingHive = ref(false)

// Filter states
const searchQuery = ref('')
const filterStatus = ref('')
const filterSensorCount = ref('')
const filterHealth = ref('')
const filterInstallDate = ref('')
const showFilters = ref(false)

// Mock alerts data - you can replace this with real alerts from API
const activeAlerts = ref([])

// Computed properties
const currentUsage = computed(() => ({
  hives: hivesWithSensorData.value?.length || 0,
  sensors: sensorsWithLatestReadings.value?.length || 0
}))

// Subscription limit checking (same pattern as sensors page)
const canAddHive = computed(() => {
  if (!subscription.value) return false
  const maxHives = subscription.value.limits?.max_hives
  return maxHives === -1 || (currentUsage.value.hives < maxHives)
})

const upgradeMessage = computed(() => {
  if (!subscription.value) return ''
  return `You've reached the hive limit for your ${subscription.value.planDisplayName} plan. Upgrade to add more hives.`
})

const filteredHives = computed(() => {
  let filtered = hivesWithSensorData.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(hive => 
      (hive.name && hive.name.toLowerCase().includes(query)) ||
      (hive.description && hive.description.toLowerCase().includes(query))
    )
  }

  // Status filter
  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    filtered = filtered.filter(hive => hive.is_active === isActive)
  }

  // Sensor count filter
  if (filterSensorCount.value) {
    filtered = filtered.filter(hive => {
      const sensorCount = hive.sensor_count || 0
      switch (filterSensorCount.value) {
        case 'none': return sensorCount === 0
        case 'low': return sensorCount >= 1 && sensorCount <= 2
        case 'medium': return sensorCount >= 3 && sensorCount <= 5
        case 'high': return sensorCount >= 6
        default: return true
      }
    })
  }

  // Health status filter
  if (filterHealth.value) {
    filtered = filtered.filter(hive => {
      const health = getHiveHealthStatus(hive)
      return health.toLowerCase() === filterHealth.value
    })
  }

  // Installation date filter
  if (filterInstallDate.value) {
    const now = new Date()
    filtered = filtered.filter(hive => {
      if (!hive.installation_date) return false
      const installDate = new Date(hive.installation_date)
      
      switch (filterInstallDate.value) {
        case 'week':
          return (now - installDate) <= 7 * 24 * 60 * 60 * 1000
        case 'month':
          return (now - installDate) <= 30 * 24 * 60 * 60 * 1000
        case 'quarter':
          return (now - installDate) <= 90 * 24 * 60 * 60 * 1000
        case 'year':
          return (now - installDate) <= 365 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || filterStatus.value || filterSensorCount.value || filterHealth.value || filterInstallDate.value)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterStatus.value) count++
  if (filterSensorCount.value) count++
  if (filterHealth.value) count++
  if (filterInstallDate.value) count++
  return count
})

// Functions
const getHiveHealthStatus = (hive) => {
  // Mock health calculation based on sensor data
  if (!hive.sensors || hive.sensors.length === 0) return 'nodata'
  
  // Check if any sensors have concerning readings
  const hasAlerts = hive.sensors.some(sensor => {
    if (!sensor.latest_reading) return false
    
    const { value, sensor_type } = sensor.latest_reading
    
    // Example thresholds - adjust based on your needs
    if (sensor_type === 'temperature') {
      return value < 30 || value > 40
    } else if (sensor_type === 'humidity') {
      return value < 45 || value > 75
    }
    
    return false
  })
  
  if (hasAlerts) return 'alert'
  
  // Check for warnings
  const hasWarnings = hive.sensors.some(sensor => {
    if (!sensor.latest_reading) return false
    
    const { value, sensor_type } = sensor.latest_reading
    
    if (sensor_type === 'temperature') {
      return value < 32 || value > 38
    } else if (sensor_type === 'humidity') {
      return value < 50 || value > 70
    }
    
    return false
  })
  
  if (hasWarnings) return 'warning'
  
  return 'healthy'
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterSensorCount.value = ''
  filterHealth.value = ''
  filterInstallDate.value = ''
}

// Modal functions
const closeAddHiveModal = () => {
  showAddHiveModal.value = false
  addingHive.value = false
}

const openHiveDetailModal = (hive) => {
  console.log('openHiveDetailModal called with:', hive)
  selectedHive.value = hive
  showHiveDetailsModal.value = true
}

const closeHiveDetailsModal = () => {
  selectedHive.value = null
  showHiveDetailsModal.value = false
}

const handleEditFromDetails = () => {
  showHiveDetailsModal.value = false // Close details modal
  showHiveDetailModal.value = true   // Open edit modal
}

const handleDeleteFromDetails = (hive) => {
  showHiveDetailsModal.value = false // Close details modal
  openDeleteHiveModal(hive)        // Open delete modal
}

const closeHiveDetailModal = () => {
  selectedHive.value = null
  showHiveDetailModal.value = false
  updatingHive.value = false
}

const openDeleteHiveModal = (hive) => {
  hiveToDelete.value = hive
  showDeleteHiveModal.value = true
}

const closeDeleteHiveModal = () => {
  showDeleteHiveModal.value = false
  hiveToDelete.value = null
  deletingHive.value = false
}

// API functions using direct calls (same pattern as sensors page)
const handleCreateHive = async (hiveData) => {
  if (addingHive.value || !user.value) return
  
  addingHive.value = true
  
  try {
    console.log('Creating hive...')
    
    // Get auth token
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }
    
    const response = await $fetch('/api/hives', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: hiveData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    console.log('Hive created successfully:', response.data)
    
    // Refresh all data to get the new hive
    await refreshData()
    
    // Close modal
    closeAddHiveModal()
    
  } catch (err) {
    console.error('Failed to create hive:', err)
    alert(err.message || 'Failed to create hive. Please try again.')
  } finally {
    addingHive.value = false
  }
}

const handleUpdateHive = async (formData) => {
  if (updatingHive.value || !user.value || !selectedHive.value) return
  
  updatingHive.value = true
  
  try {
    console.log('Updating hive...')
    console.log('Hive ID:', selectedHive.value.id)
    console.log('Update data:', formData)
    
    // Get auth token
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }
    
    const response = await $fetch(`/api/hives/${selectedHive.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: formData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    console.log('Hive updated successfully:', response.data)
    
    // Refresh all data to get the updated hive
    await refreshData()
    
    // Close modal
    closeHiveDetailModal()
    
  } catch (err) {
    console.error('Failed to update hive:', err)
    alert(err.message || 'Failed to update hive. Please try again.')
  } finally {
    updatingHive.value = false
  }
}

const handleDeleteHive = async (hive) => {
  if (deletingHive.value || !user.value) return
  
  deletingHive.value = true
  
  try {
    console.log('Deleting hive...')
    
    // Get auth token
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }
    
    const response = await $fetch(`/api/hives/${hive.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    console.log('Hive deleted successfully')
    
    // Refresh all data to remove the deleted hive
    await refreshData()
    
    // Close modals
    closeDeleteHiveModal()
    closeHiveDetailsModal()
    
  } catch (err) {
    console.error('Failed to delete hive:', err)
    alert(err.message || 'Failed to delete hive. Please try again.')
  } finally {
    deletingHive.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load subscription
  await loadSubscription()
  
  // Clear any existing errors
  clearError()
})
</script>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Remove default select styling and add custom arrow */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
}

/* Custom scrollbar for hive list */
.space-y-3::-webkit-scrollbar {
  width: 4px;
}

.space-y-3::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.space-y-3::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Hover effects for hive cards */
.cursor-pointer:hover {
  transform: translateY(-1px);
}
</style>