<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Alert Banner -->
      <div v-if="criticalAlerts.length > 0" class="bg-red-600 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
          </svg>
          <span class="font-semibold">Critical Alerts:</span>
          <span>{{ criticalAlerts.length }} hive(s) need immediate attention</span>
        </div>
      </div>

      <!-- Main Layout: Hives Grid + Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Hive Status Overview Section -->
        <div class="lg:col-span-3">
          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Hive Status Overview</h2>
              <div class="text-sm text-gray-400">
                {{ hiveData.length }} {{ hiveData.length === 1 ? 'hive' : 'hives' }} total
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
              <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-400">Loading your hives...</p>
            </div>

            <!-- Hives Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <!-- Existing Hive Cards -->
              <div 
                v-for="hive in hiveData" 
                :key="hive.id"
                @click="navigateToHive(hive)"
                class="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-700 hover:border-gray-600"
              >
                <!-- Hive Header -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-lg truncate">{{ hive.name || `Hive ${hive.id}` }}</h3>
                    <p v-if="hive.description" class="text-xs text-gray-400 truncate">
                      {{ hive.description }}
                    </p>
                    <p v-else class="text-xs text-gray-400">No description</p>
                  </div>
                  <div class="flex items-center space-x-1 flex-shrink-0">
                    <div :class="getHiveStatus(hive).color" class="w-2 h-2 rounded-full"></div>
                    <span class="text-xs" :class="getHiveStatus(hive).textColor">{{ getHiveStatus(hive).status }}</span>
                  </div>
                </div>

                <!-- Metrics Grid -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="text-center">
                    <div class="text-sm text-gray-400 mb-1">Temp</div>
                    <div class="font-medium">{{ hive.temperature ? `${hive.temperature.toFixed(1)}°C` : 'N/A' }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm text-gray-400 mb-1">Humidity</div>
                    <div class="font-medium">{{ hive.humidity ? `${hive.humidity.toFixed(1)}%` : 'N/A' }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm text-gray-400 mb-1">Weight</div>
                    <div class="font-medium">{{ hive.weight ? `${(hive.weight / 1000).toFixed(1)}kg` : 'N/A' }}</div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span class="text-xs text-gray-400">{{ formatTime(getLastUpdateTime(hive)) }}</span>
                  <span class="text-xs text-blue-400">View Details →</span>
                </div>
              </div>

              <!-- Add New Hive Card -->
              <div
                @click="showAddHiveModal = true"
                class="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-gray-500 hover:bg-gray-750 transition-colors flex flex-col items-center justify-center min-h-[180px]"
              >
                <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 text-gray-300">Add New Hive</h3>
                <p class="text-gray-400 text-sm text-center">
                  Click to add a new hive to your monitoring network
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Alerts & System Info -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Active Alerts -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Active Alerts</h3>
              <span class="text-xs text-gray-400">{{ activeAlerts.length }} active</span>
            </div>
            
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div v-if="activeAlerts.length === 0" class="text-center py-8 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <p class="text-sm">All systems normal</p>
              </div>
              
              <div v-for="alert in activeAlerts.slice(0, 5)" :key="alert.id" 
                   class="p-3 rounded-lg" 
                   :class="alert.severity === 'critical' ? 'bg-red-900/30 border border-red-500/30' : 
                           alert.severity === 'warning' ? 'bg-yellow-900/30 border border-yellow-500/30' : 
                           'bg-blue-900/30 border border-blue-500/30'">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ alert.title }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ alert.hiveName }} • {{ formatTime(alert.created_at) }}</p>
                  </div>
                  <button @click="dismissAlert(alert.id)" class="text-xs text-gray-400 hover:text-white ml-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <h3 class="font-semibold mb-3">System Status</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm">Sensor Network</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Data Sync</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span class="text-xs text-green-400">Synced</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Battery Levels</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span class="text-xs text-yellow-400">Good</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm">Last Update</span>
                <span class="text-xs text-gray-400">{{ lastUpdateTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Add New Hive Modal -->
      <div v-if="showAddHiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 class="text-xl font-semibold">Add New Hive</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-white transition-colors"
              :disabled="addingHive"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <!-- Modal Content -->
          <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <!-- Required: Hive Name -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Hive Name <span class="text-red-400">*</span>
              </label>
              <input
                v-model="newHive.name"
                type="text"
                placeholder="e.g., Hive A, North Garden Hive"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                :disabled="addingHive"
                @keyup.enter="handleAddHive"
              />
            </div>
            
            <!-- Optional: Description -->
            <div>
              <label class="block text-sm font-medium mb-2">Description</label>
              <textarea
                v-model="newHive.description"
                placeholder="e.g., Strong colony, good honey production"
                rows="3"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                :disabled="addingHive"
              ></textarea>
            </div>
            
            <!-- Optional: Location -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Latitude</label>
                <input
                  v-model="newHive.latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., -43.5321"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :disabled="addingHive"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Longitude</label>
                <input
                  v-model="newHive.longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 172.6362"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  :disabled="addingHive"
                />
              </div>
            </div>
            
            <!-- Optional: Installation Date -->
            <div>
              <label class="block text-sm font-medium mb-2">Installation Date</label>
              <input
                v-model="newHive.installation_date"
                type="date"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                :disabled="addingHive"
              />
            </div>
          </div>
          
          <!-- Modal Footer -->
          <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
            <button
              @click="closeModal"
              class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              :disabled="addingHive"
            >
              Cancel
            </button>
            <button
              @click="handleAddHive"
              :disabled="!isFormValid || addingHive"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg v-if="addingHive" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ addingHive ? 'Adding...' : 'Add Hive' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Meta
definePageMeta({
  title: 'My Hives - BeeVibe Dashboard'
})

// Reactive data
const loading = ref(true)
const showAddHiveModal = ref(false)
const addingHive = ref(false) // Loading state for add operation

// Enhanced form data for new hive
const newHive = ref({
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  installation_date: new Date().toISOString().split('T')[0]
})

// Data refs
const hiveData = ref([])
const alerts = ref([])
const sensors = ref([])

// Update interval
let updateInterval

// Form validation
const isFormValid = computed(() => {
  return newHive.value.name.trim().length > 0
})

// Computed properties
const activeAlerts = computed(() => {
  return alerts.value
    .filter(alert => !alert.resolved)
    .map(alert => ({
      ...alert,
      hiveName: hiveData.value.find(h => h.id === alert.hive_id)?.name || 'Unknown Hive'
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const criticalAlerts = computed(() => {
  return activeAlerts.value.filter(alert => alert.severity === 'critical')
})

const lastUpdateTime = computed(() => {
  const times = hiveData.value
    .map(h => [h.temperature_time, h.humidity_time, h.weight_time])
    .flat()
    .filter(Boolean)
    .map(t => new Date(t))
  
  if (times.length === 0) return 'Never'
  
  const mostRecent = Math.max(...times)
  return formatTime(mostRecent)
})

// Functions
const getHiveStatus = (hive) => {
  const temp = hive.temperature
  const humidity = hive.humidity
  
  if (!temp || !humidity) {
    return { status: 'No Data', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  if (temp < 30 || temp > 40 || humidity < 45 || humidity > 75) {
    return { status: 'Alert', color: 'bg-red-400', textColor: 'text-red-400' }
  } else if (temp < 32 || temp > 38 || humidity < 50 || humidity > 70) {
    return { status: 'Warning', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
  } else {
    return { status: 'Healthy', color: 'bg-green-400', textColor: 'text-green-400' }
  }
}

const getHiveDisplayName = (hive) => {
  return hive.name || hive.description || `Hive ${hive.id}`
}

const getLastUpdateTime = (hive) => {
  const times = [hive.temperature_time, hive.humidity_time, hive.weight_time]
    .filter(Boolean)
    .map(t => new Date(t))
  
  if (times.length === 0) return new Date()
  return Math.max(...times)
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const navigateToHive = (hive) => {
  // Navigate to individual hive page with graphs
  navigateTo(`/hives/${hive.uuid || hive.id}`)
}

const resetForm = () => {
  newHive.value = {
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    installation_date: new Date().toISOString().split('T')[0]
  }
}

const closeModal = () => {
  showAddHiveModal.value = false
  resetForm()
  addingHive.value = false
}

const handleAddHive = async () => {
  if (!isFormValid.value || addingHive.value) return
  
  addingHive.value = true
  
  try {
    const { data, error } = await $fetch('/api/hives', {
      method: 'POST',
      body: {
        name: newHive.value.name.trim(),
        description: newHive.value.description.trim() || newHive.value.name.trim(),
        latitude: newHive.value.latitude ? parseFloat(newHive.value.latitude) : null,
        longitude: newHive.value.longitude ? parseFloat(newHive.value.longitude) : null,
        installation_date: newHive.value.installation_date,
        is_active: true
      }
    })
    
    if (!error && data) {
      // Add to local state
      hiveData.value.push(data)
      
      // Show success message (you could use a toast notification here)
      console.log('Hive added successfully!')
      
      // Close modal and reset form
      closeModal()
      
      // Optionally refresh data to ensure consistency
      await fetchHiveData()
    }
  } catch (error) {
    console.error('Failed to add hive:', error)
    // Handle error - could show error toast or set error state
    alert('Failed to add hive. Please try again.')
  } finally {
    addingHive.value = false
  }
}

const dismissAlert = async (alertId) => {
  try {
    const { data, error } = await $fetch(`/api/alerts/${alertId}`, {
      method: 'PUT',
      body: {
        resolved: true,
        resolved_at: new Date().toISOString()
      }
    })
    
    if (!error) {
      // Remove from local state
      alerts.value = alerts.value.filter(a => a.id !== alertId)
    }
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
  }
}

// Data fetching functions
const fetchHiveData = async () => {
  try {
    const { data, error } = await $fetch('/api/hives/latest')
    if (!error && data) {
      hiveData.value = data
    }
  } catch (error) {
    console.error('Failed to fetch hive data:', error)
  }
}

const fetchAlerts = async () => {
  try {
    const { data, error } = await $fetch('/api/alerts')
    if (!error && data) {
      alerts.value = data
    }
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
  }
}

const fetchSensors = async () => {
  try {
    const { data, error } = await $fetch('/api/sensors')
    if (!error && data) {
      sensors.value = data
    }
  } catch (error) {
    console.error('Failed to fetch sensors:', error)
  }
}

const loadAllData = async () => {
  loading.value = true
  await Promise.all([
    fetchHiveData(),
    fetchAlerts(),
    fetchSensors()
  ])
  loading.value = false
}

// Lifecycle
onMounted(async () => {
  await loadAllData()
  
  // Set up auto-refresh every 30 seconds
  updateInterval = setInterval(loadAllData, 600000);
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar for alerts */
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

/* Hover effects */
.hover\:bg-gray-750:hover {
  background-color: rgb(55, 65, 81, 0.8);
}
</style>