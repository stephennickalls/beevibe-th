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
              {{ filteredSensors.length }} of {{ sensorsWithLatestReadings.length }} sensors
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
                placeholder="Name, type, or hive..."
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <!-- Type Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Sensor Type</label>
              <div class="relative">
                <select v-model="filterType" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Types</option>
                  <option v-for="type in availableSensorTypes" :key="type" :value="type">
                    {{ formatSensorType(type) }}
                  </option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <div class="relative">
                <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Hive Assignment Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Hive Assignment</label>
              <div class="relative">
                <select v-model="filterAssignment" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Hives</option>
                  <option value="unassigned">Unassigned</option>
                  <option v-for="hive in hivesWithSensorData" :key="hive.id" :value="hive.id">
                    {{ hive.name }}
                  </option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Additional Filters Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Battery Level Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Battery Level</label>
              <div class="relative">
                <select v-model="filterBattery" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Levels</option>
                  <option value="low">Low (< 20%)</option>
                  <option value="medium">Medium (20-50%)</option>
                  <option value="high">High (> 50%)</option>
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
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto mb-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div v-if="!hasActiveFilters" class="text-4xl mb-2">🔧</div>
        </div>
        <h3 class="text-lg font-semibold mb-2">
          {{ hasActiveFilters ? 'No Sensors Match Your Filters' : 'Ready to Add Your First Sensor?' }}
        </h3>
        <p class="text-gray-400 mb-4">
          {{ hasActiveFilters ? 'Try adjusting your filters to find the sensors you\'re looking for.' : 'Start monitoring your hives by adding temperature, humidity, and other sensors.' }}
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

      <!-- Sensors Grid with SensorCard Component -->
      <div v-else class="space-y-3">
        <SensorCard
          v-for="sensor in filteredSensors"
          :key="sensor.id"
          :sensor="sensor"
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

      <!-- Sensor Details Modal (the main details view) -->
      <SensorDetailsModal
        :show="showSensorDetailsModal"
        :sensor="selectedSensor"
        @close="closeSensorDetailsModal"
        @edit="handleEditFromDetails"
        @delete="handleDeleteFromDetails"
      />

      <!-- Sensor Edit Modal (opens when edit is clicked from details) -->
      <SensorEditModal
        v-if="selectedSensor"
        :show="showSensorDetailModal"
        :sensor="selectedSensor"
        :available-hives="hivesWithSensorData"
        :updating="updatingSensor"
        @close="closeSensorDetailModal"
        @save="handleUpdateSensor"
        @delete="openDeleteSensorModal"
      />

      <!-- Delete Sensor Modal -->
      <DeleteSensorModal
        :show="showDeleteSensorModal"
        :sensor="sensorToDelete"
        :deleting="deletingSensor"
        @close="closeDeleteSensorModal"
        @delete="handleDeleteSensor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SensorCard from '~/components/sensor/SensorCard.vue'
import AddSensorModal from '~/components/sensor/AddSensorModal.vue'
import SensorEditModal from '~/components/sensor/SensorEditModal.vue'
import DeleteSensorModal from '~/components/sensor/DeleteSensorModal.vue'
import SensorDetailsModal from '~/components/sensor/SensorDetailsModal.vue'

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

// Use the centralized sensor service
const { updateSensor, deleteSensor, createSensor } = useSensorService()

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// Reactive data for modals and forms
const showAddSensorModal = ref(false)
const showSensorDetailsModal = ref(false)  // Main details modal
const showSensorDetailModal = ref(false)   // Edit modal (keeping original name for compatibility)
const showDeleteSensorModal = ref(false)
const selectedSensor = ref(null)
const sensorToDelete = ref(null)

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

// Mock alerts data - you can replace this with real alerts from API
const activeAlerts = ref([])

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

// Functions - removed styling functions since they're now in SensorCard component
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

// const openSensorDetailModal = (sensor) => {
//   selectedSensor.value = sensor
//   showSensorDetailsModal.value = true  // Open details modal instead of edit modal
// }

const openSensorDetailModal = (sensor) => {
  console.log('openSensorDetailModal called with:', sensor)
  console.log('Sensor type:', typeof sensor)
  console.log('Is PointerEvent:', sensor?.constructor?.name === 'PointerEvent')
  
  selectedSensor.value = sensor
  showSensorDetailsModal.value = true
}

const closeSensorDetailsModal = () => {
  selectedSensor.value = null
  showSensorDetailsModal.value = false
}

const handleEditFromDetails = () => {
  showSensorDetailsModal.value = false // Close details modal
  showSensorDetailModal.value = true   // Open edit modal
}

const handleDeleteFromDetails = (sensor) => {
  showSensorDetailsModal.value = false // Close details modal
  openDeleteSensorModal(sensor)        // Open delete modal
}

const closeSensorDetailModal = () => {
  selectedSensor.value = null
  showSensorDetailModal.value = false
  updatingSensor.value = false
}

const openDeleteSensorModal = (sensor) => {
  sensorToDelete.value = sensor
  showDeleteSensorModal.value = true
}

const closeDeleteSensorModal = () => {
  showDeleteSensorModal.value = false
  sensorToDelete.value = null
  deletingSensor.value = false
}

// API functions using the centralized service
const handleCreateSensor = async (sensorData) => {
  if (addingSensor.value || !user.value) return
  
  addingSensor.value = true
  
  try {
    console.log('Creating sensor using centralized service...')
    
    // Use the centralized service
    const newSensor = await createSensor(sensorData)
    
    console.log('Sensor created successfully:', newSensor)
    
    // Refresh all data to get the new sensor
    await refreshData()
    
    // Close modal
    closeAddSensorModal()
    
  } catch (err) {
    console.error('Failed to create sensor:', err)
    alert(err.message || 'Failed to create sensor. Please try again.')
  } finally {
    addingSensor.value = false
  }
}

const handleUpdateSensor = async (formData) => {
  if (updatingSensor.value || !user.value || !selectedSensor.value) return
  
  updatingSensor.value = true
  
  try {
    console.log('Updating sensor using centralized service...')
    console.log('Sensor ID:', selectedSensor.value.id)
    console.log('Update data:', formData)
    
    // Use the centralized service with the correct sensor ID
    const updatedSensor = await updateSensor(selectedSensor.value.id, formData)
    
    console.log('Sensor updated successfully:', updatedSensor)
    
    // Refresh all data to get the updated sensor
    await refreshData()
    
    // Close modal
    closeSensorDetailModal()
    
  } catch (err) {
    console.error('Failed to update sensor:', err)
    alert(err.message || 'Failed to update sensor. Please try again.')
  } finally {
    updatingSensor.value = false
  }
}

const handleDeleteSensor = async (sensor) => {
  if (deletingSensor.value || !user.value) return
  
  deletingSensor.value = true
  
  try {
    console.log('Deleting sensor using centralized service...')
    
    // Use the centralized service
    await deleteSensor(sensor.id)
    
    console.log('Sensor deleted successfully')
    
    // Refresh all data to remove the deleted sensor
    await refreshData()
    
    // Close modals
    closeDeleteSensorModal()
    closeSensorDetailsModal()
    
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

/* Hover effects for sensor cards */
.cursor-pointer:hover {
  transform: translateY(-1px);
}
</style>