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
          <h1 class="text-3xl font-bold">Sensors</h1>
          <p class="text-gray-400 mt-1">Manage all sensors across your hives</p>
        </div>
        <div class="flex space-x-3">
          <button @click="showAddSensorModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Sensor</span>
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
            </button>
            
            <div class="text-sm text-gray-400">
              {{ filteredSensors.length }} of {{ sensorsWithLatestReadings.length }} sensors
            </div>
          </div>
          
          <div v-if="hasActiveFilters" class="flex items-center space-x-2">
            <span class="text-xs text-gray-400">{{ activeFilterCount }} filters active</span>
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
                placeholder="Name, type, or hive..."
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Sensor Type</label>
              <select v-model="filterType" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">All Types</option>
                <option v-for="type in availableSensorTypes" :key="type" :value="type">
                  {{ formatSensorType(type) }}
                </option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <!-- Hive Assignment Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Hive Assignment</label>
              <select v-model="filterAssignment" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">All Hives</option>
                <option value="unassigned">Unassigned</option>
                <option v-for="hive in hivesWithSensorData" :key="hive.id" :value="hive.id">
                  {{ hive.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Additional Filters Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Battery Level Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Battery Level</label>
              <select v-model="filterBattery" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm">
                <option value="">All Levels</option>
                <option value="low">Low (< 20%)</option>
                <option value="medium">Medium (20-50%)</option>
                <option value="high">High (> 50%)</option>
              </select>
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
        <p class="text-gray-400">Loading sensors...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Error Loading Sensors</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button @click="refreshData" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Try Again
          </button>
        </div>
      </div>

      <!-- No Sensors State -->
      <div v-else-if="filteredSensors.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-semibold mb-2">No Sensors Found</h3>
        <p class="text-gray-400 mb-4">
          {{ hasActiveFilters ? 'No sensors match your current filters.' : 'Get started by adding your first sensor.' }}
        </p>
        <div class="flex justify-center space-x-3">
          <button v-if="hasActiveFilters" @click="clearFilters" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Clear Filters
          </button>
          <button v-else @click="showAddSensorModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors cursor-pointer">
            Add First Sensor
          </button>
        </div>
      </div>

      <!-- Sensors Grid -->
      <div v-else class="space-y-3">
        <SensorListItem
          v-for="sensor in filteredSensors"
          :key="sensor.id"
          :sensor="sensor"
          mode="page"
          @click="openSensorDetailModal"
        />
      </div>

      <!-- Add Sensor Modal -->
      <AddSensorModal
        :show="showAddSensorModal"
        :creating="addingSensor"
        :available-hives="hivesWithSensorData"
        :subscription="subscription"
        :current-usage="currentUsage"
        @close="closeAddSensorModal"
        @create="handleCreateSensor"
      />

      <!-- Sensor Detail Modal -->
      <SensorEditModal
        v-if="selectedSensor"
        :show="showSensorDetailModal"
        :sensor="selectedSensor"
        :available-hives="hivesWithSensorData"
        :updating="updatingSensor"
        @close="closeSensorDetailModal"
        @update="handleUpdateSensor"
        @delete="openDeleteSensorModal"
      />

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 class="text-xl font-semibold text-red-400">Delete Sensor</h3>
            <button @click="closeDeleteSensorModal" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <p class="text-gray-300 mb-4">
              This action cannot be undone. This will permanently delete the sensor and all its data.
            </p>
            
            <div class="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 class="font-semibold mb-2">Sensor to Delete:</h4>
              <p class="text-sm text-gray-300">{{ deleteSensorForm.sensorToDelete?.name || `${deleteSensorForm.sensorToDelete?.sensor_type} Sensor` }}</p>
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2">
                Type <span class="font-bold">{{ deleteSensorForm.sensorToDelete?.name || 'DELETE' }}</span> to confirm:
              </label>
              <input 
                v-model="deleteSensorForm.confirmationName" 
                type="text" 
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500"
                :placeholder="deleteSensorForm.sensorToDelete?.name || 'DELETE'"
              />
            </div>
            
            <div class="flex justify-end space-x-3">
              <button @click="closeDeleteSensorModal" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button 
                @click="handleDeleteSensor" 
                :disabled="!canDelete || deletingSensor"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
              >
                <span>{{ deletingSensor ? 'Deleting...' : 'Delete Sensor' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SensorListItem from '~/components/SensorListItem.vue'
import AddSensorModal from '~/components/AddSensorModal.vue'
import SensorEditModal from '~/components/SensorEditModal.vue'

// Meta
definePageMeta({
  title: 'Sensors - BeeVibe Dashboard',
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

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// Reactive data for modals and forms
const showAddSensorModal = ref(false)
const showSensorDetailModal = ref(false)
const showDeleteSensorModal = ref(false)
const selectedSensor = ref(null)

// Loading states
const addingSensor = ref(false)
const updatingSensor = ref(false)
const deletingSensor = ref(false)

// Filter states
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterAssignment = ref('')
const filterBattery = ref('')
const showFilters = ref(false)

// Form data
const deleteSensorForm = ref({
  sensorToDelete: null,
  confirmationName: ''
})

// Mock alerts data - you can replace this with real alerts from API
const activeAlerts = ref([])

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Computed properties
const currentUsage = computed(() => ({
  hives: hivesWithSensorData.value?.length || 0,
  sensors: sensorsWithLatestReadings.value?.length || 0
}))

const availableSensorTypes = computed(() => {
  const types = new Set(sensorsWithLatestReadings.value.map(s => s.sensor_type))
  return Array.from(types).sort()
})

const filteredSensors = computed(() => {
  let filtered = sensorsWithLatestReadings.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sensor => 
      (sensor.name && sensor.name.toLowerCase().includes(query)) ||
      sensor.sensor_type.toLowerCase().includes(query) ||
      (sensor.model && sensor.model.toLowerCase().includes(query)) ||
      (sensor.hives?.name && sensor.hives.name.toLowerCase().includes(query))
    )
  }

  // Type filter
  if (filterType.value) {
    filtered = filtered.filter(sensor => sensor.sensor_type === filterType.value)
  }

  // Status filter
  if (filterStatus.value) {
    const isOnline = filterStatus.value === 'online'
    filtered = filtered.filter(sensor => sensor.is_online === isOnline)
  }

  // Assignment filter
  if (filterAssignment.value) {
    if (filterAssignment.value === 'unassigned') {
      filtered = filtered.filter(sensor => !sensor.hive_id)
    } else {
      filtered = filtered.filter(sensor => sensor.hive_id && sensor.hive_id.toString() === filterAssignment.value)
    }
  }

  // Battery filter
  if (filterBattery.value) {
    filtered = filtered.filter(sensor => {
      const level = sensor.battery_level || 0
      switch (filterBattery.value) {
        case 'low': return level < 20
        case 'medium': return level >= 20 && level <= 50
        case 'high': return level > 50
        default: return true
      }
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || filterType.value || filterStatus.value || filterAssignment.value || filterBattery.value)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterType.value) count++
  if (filterStatus.value) count++
  if (filterAssignment.value) count++
  if (filterBattery.value) count++
  return count
})

const canDelete = computed(() => {
  const expectedName = deleteSensorForm.value.sensorToDelete?.name || 'DELETE'
  return deleteSensorForm.value.confirmationName === expectedName
})

// Functions
const formatSensorType = (type) => {
  const labels = {
    'temperature': 'Temperature',
    'humidity': 'Humidity', 
    'weight': 'Weight Scale',
    'sound': 'Sound Level',
    'vibration': 'Vibration',
    'activity': 'Activity'
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const clearFilters = () => {
  searchQuery.value = ''
  filterType.value = ''
  filterStatus.value = ''
  filterAssignment.value = ''
  filterBattery.value = ''
}

// Modal functions
const closeAddSensorModal = () => {
  showAddSensorModal.value = false
  addingSensor.value = false
}

const openSensorDetailModal = (sensor) => {
  selectedSensor.value = sensor
  showSensorDetailModal.value = true
}

const closeSensorDetailModal = () => {
  selectedSensor.value = null
  showSensorDetailModal.value = false
  updatingSensor.value = false
}

const openDeleteSensorModal = (sensor) => {
  deleteSensorForm.value.sensorToDelete = sensor
  deleteSensorForm.value.confirmationName = ''
  showDeleteSensorModal.value = true
}

const closeDeleteSensorModal = () => {
  showDeleteSensorModal.value = false
  deleteSensorForm.value = {
    sensorToDelete: null,
    confirmationName: ''
  }
  deletingSensor.value = false
}

// API functions
const handleCreateSensor = async (sensorData) => {
  if (addingSensor.value || !user.value) return
  
  addingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch('/api/sensors', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: sensorData
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      // Refresh all data to get the new sensor
      await refreshData()
      
      // Close modal
      closeAddSensorModal()
    }
  } catch (err) {
    console.error('Failed to create sensor:', err)
    alert(err.message || 'Failed to create sensor. Please try again.')
  } finally {
    addingSensor.value = false
  }
}

const handleUpdateSensor = async (sensorId, updateData) => {
  if (updatingSensor.value || !user.value) return
  
  updatingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/sensors/${sensorId}`, {
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
    
    if (response.data) {
      // Refresh all data to get the updated sensor
      await refreshData()
      
      // Close modal
      closeSensorDetailModal()
    }
  } catch (err) {
    console.error('Failed to update sensor:', err)
    alert(err.message || 'Failed to update sensor. Please try again.')
  } finally {
    updatingSensor.value = false
  }
}

const handleDeleteSensor = async () => {
  if (deletingSensor.value || !user.value || !canDelete.value) return
  
  deletingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const sensorId = deleteSensorForm.value.sensorToDelete.id
    const response = await $fetch(`/api/sensors/${sensorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    // Refresh all data to remove the deleted sensor
    await refreshData()
    
    // Close modals
    closeDeleteSensorModal()
    closeSensorDetailModal()
  } catch (err) {
    console.error('Failed to delete sensor:', err)
    alert(err.message || 'Failed to delete sensor. Please try again.')
  } finally {
    deletingSensor.value = false
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

/* Custom scrollbar for sensor list */
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
</style>