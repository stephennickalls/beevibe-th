<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <SystemStatusStrip
        :online-sensors="12"
        :total-sensors="15"
        :low-battery-sensors="2"
        :last-update="new Date()"
        :data-sync="true"
        :show-refresh="true"
        :refreshing="false"
        @refresh="handleRefresh"
      />

      <SubscriptionStrip
        :user="user"
        :subscription="subscription"
        :current-usage="currentUsage"
        @upgrade="navigateTo('/pricing')"
      />
      
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

      <!-- Error Banner -->
      <div v-if="error" class="bg-red-600 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <span class="font-semibold">Error:</span>
            <span>{{ error }}</span>
          </div>
          <button @click="error = null" class="text-white hover:text-gray-200">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
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
            <LoadingState v-if="loading" message="Loading your hives..." />

            <!-- Authentication Required State -->
            <div v-else-if="!user" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
              </svg>
              <h3 class="text-lg font-semibold mb-2 text-gray-300">Authentication Required</h3>
              <p class="text-gray-400 mb-4">Please log in to view your hives</p>
              <button 
                @click="navigateTo('/auth/login')"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>

            <!-- Hive Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <!-- Hive Cards -->
              <HiveCard
                v-for="hive in hiveData"
                :key="hive.id"
                :hive="hive"
                @click="navigateToHive"
                @sensor-click="showSensorDetails"
              />

              <!-- Add New Hive Card -->
              <div
                v-if="user"
                @click="showAddHiveModal = true"
                class="bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 cursor-pointer hover:border-gray-500 hover:bg-gray-750 transition-colors flex flex-col items-center justify-center min-h-[280px]"
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
              <div v-if="!user" class="text-center py-8 text-gray-400">
                <p class="text-sm">Login to view alerts</p>
              </div>
              
              <div v-else-if="activeAlerts.length === 0" class="text-center py-8 text-gray-400">
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

      <!-- Add Hive Modal Component -->
      <AddHiveModal
        :show="showAddHiveModal"
        :creating="addingHive"
        :subscription="subscription"
        :current-usage="currentUsage"
        @close="closeModal"
        @create="handleAddHive"
      />

      <!-- Sensor Details Modal -->
      <div v-if="showSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
          <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h3 class="text-lg font-semibold">Sensor Details</h3>
            <button @click="closeSensorModal" class="text-gray-400 hover:text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedSensorDetails" class="p-4 space-y-4">
            <!-- Sensor Basic Info -->
            <div>
              <h4 class="font-medium mb-2">{{ selectedSensorDetails.sensor.name || `${selectedSensorDetails.sensor.sensor_type} Sensor` }}</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">Type:</span>
                  <span class="ml-2">{{ getSensorTypeLabel(selectedSensorDetails.sensor.sensor_type) }}</span>
                </div>
                <div>
                  <span class="text-gray-400">Status:</span>
                  <span class="ml-2" :class="selectedSensorDetails.sensor.is_online ? 'text-green-400' : 'text-red-400'">
                    {{ selectedSensorDetails.sensor.is_online ? 'Online' : 'Offline' }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-400">Battery:</span>
                  <span class="ml-2" :class="getBatteryColor(selectedSensorDetails.sensor.battery_level)">
                    {{ selectedSensorDetails.sensor.battery_level }}%
                  </span>
                </div>
                <div v-if="selectedSensorDetails.sensor.model">
                  <span class="text-gray-400">Model:</span>
                  <span class="ml-2">{{ selectedSensorDetails.sensor.model }}</span>
                </div>
              </div>
            </div>

            <!-- Latest Reading -->
            <div v-if="selectedSensorDetails.sensor.latest_reading" class="border-t border-gray-700 pt-4">
              <h5 class="font-medium mb-2">Latest Reading</h5>
              <div class="bg-gray-900 rounded-lg p-3">
                <div class="text-2xl font-bold mb-1">
                  {{ formatSensorValue(selectedSensorDetails.sensor.latest_reading.value, selectedSensorDetails.sensor.sensor_type, selectedSensorDetails.sensor.latest_reading.unit) }}
                </div>
                <div class="text-sm text-gray-400">
                  {{ formatDateTime(selectedSensorDetails.sensor.latest_reading.reading_time) }}
                </div>
                <div v-if="selectedSensorDetails.sensor.latest_reading.signal_strength" class="text-xs text-gray-500 mt-1">
                  Signal: {{ selectedSensorDetails.sensor.latest_reading.signal_strength }}%
                </div>
              </div>
            </div>

            <!-- No Reading State -->
            <div v-else class="border-t border-gray-700 pt-4 text-center">
              <div class="text-gray-400 py-4">
                <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
                <p class="text-sm">No readings available</p>
              </div>
            </div>

            <!-- Hive Info -->
            <div class="border-t border-gray-700 pt-4">
              <h5 class="font-medium mb-2">Hive Assignment</h5>
              <p class="text-sm text-gray-400">
                Assigned to: <span class="text-white">{{ selectedSensorDetails.hive.name }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AddHiveModal from '~/components/AddHiveModal.vue'
import SubscriptionStrip from '~/components/SubscriptionStrip.vue'
import SystemStatusStrip from '~/components/SystemStatusStrip.vue'
import HiveCard from '~/components/HiveCard.vue'
import LoadingState from '~/components/LoadingState.vue'

// Meta
definePageMeta({
  title: 'My Hives - BeeVibe Dashboard'
})

// Get user from Supabase auth
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// Reactive data
const loading = ref(true)
const showAddHiveModal = ref(false)
const addingHive = ref(false)
const error = ref(null)

// Data refs
const hiveData = ref([])
const alerts = ref([])
const sensors = ref([])

// Current usage data for the modal (subscription comes from useSubscription)
const currentUsage = ref({ hives: 0, sensors: 0 })

// Sensor modal state
const showSensorModal = ref(false)
const selectedSensorDetails = ref(null)

// Update interval
let updateInterval

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
  navigateTo(`/hives/${hive.uuid || hive.id}`)
}

const closeModal = () => {
  showAddHiveModal.value = false
  addingHive.value = false
}

// Sensor detail functions
const showSensorDetails = (sensor, hive) => {
  selectedSensorDetails.value = { sensor, hive }
  showSensorModal.value = true
}

const closeSensorModal = () => {
  showSensorModal.value = false
  selectedSensorDetails.value = null
}

const getSensorTypeLabel = (type) => {
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

const formatSensorValue = (value, type, unit) => {
  if (value === null || value === undefined) return 'N/A'
  
  const numValue = parseFloat(value)
  
  switch (type) {
    case 'temperature':
      return `${numValue.toFixed(1)}°C`
    case 'humidity':
      return `${numValue.toFixed(1)}%`
    case 'weight':
      return `${(numValue / 1000).toFixed(1)}kg`
    default:
      return unit ? `${numValue.toFixed(1)}${unit}` : numValue.toFixed(1)
  }
}

const getBatteryColor = (level) => {
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

const handleAddHive = async (hiveData) => {
  if (addingHive.value || !user.value) return
  
  addingHive.value = true
  error.value = null
  
  try {
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
    
    if (response.data) {
      // Add to local state
      hiveData.value.push(response.data)
      
      // Update subscription info if provided
      if (response.subscription_info) {
        currentUsage.value = {
          hives: response.subscription_info.hives_used,
          sensors: response.subscription_info.sensors_used
        }
      } else {
        // Fallback: just increment local count
        currentUsage.value.hives = (currentUsage.value.hives || 0) + 1
      }
      
      // Close modal
      closeModal()
    }
  } catch (err) {
    console.error('Failed to add hive:', err)
    error.value = err.message || 'Failed to add hive. Please try again.'
  } finally {
    addingHive.value = false
  }
}

const dismissAlert = async (alertId) => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.value.email || 'User'
      }
    })
    
    if (!response.error) {
      // Remove from local state
      alerts.value = alerts.value.filter(a => a.id !== alertId)
    }
  } catch (error) {
    console.error('Failed to dismiss alert:', error)
    error.value = 'Failed to dismiss alert'
  }
}

// Data fetching functions
const fetchHiveData = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) {
      console.error('No auth token available')
      return
    }

    console.log('Fetching hives for user:', user.value.id)
    
    const response = await $fetch('/api/hives', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('Hives API response:', response)
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      hiveData.value = response.data
      console.log(`Loaded ${response.data.length} hives for user`)
    }
  } catch (err) {
    console.error('Failed to fetch hive data:', err)
    error.value = 'Failed to load hive data'
  }
}

const fetchAlerts = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      alerts.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch alerts:', err)
    // Don't show error for alerts as it's not critical
  }
}

const fetchSensors = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/sensors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      sensors.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch sensors:', err)
    // Don't show error for sensors as it's not critical
  }
}

const loadAllData = async () => {
  if (!user.value || loading.value) { // Prevent concurrent loads
    loading.value = false
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    // Load subscription first
    await loadSubscription()
    
    await Promise.all([
      fetchHiveData(),
      fetchAlerts(),
      fetchSensors()
    ])
    
    // Update current usage after loading data
    currentUsage.value = {
      hives: hiveData.value?.length || 0,
      sensors: sensors.value?.length || 0
    }
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = 'Failed to load data. Please refresh the page.'
  } finally {
    loading.value = false
  }
}

// Watch for user changes - but prevent infinite loops
watch(user, async (newUser, oldUser) => {
  // Only fetch if user actually changed (not just reactive updates)
  if (newUser?.id !== oldUser?.id) {
    if (newUser) {
      await loadAllData()
    } else {
      // Clear data when user logs out
      hiveData.value = []
      alerts.value = []
      sensors.value = []
      loading.value = false
    }
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Initial load if user is already authenticated
  if (user.value) {
    await loadAllData()
  }
  
  // Set up auto-refresh every 15 minutes for authenticated users
  updateInterval = setInterval(async () => {
    if (user.value && !loading.value) { // Prevent overlapping requests
      console.log('Auto-refreshing data...')
      await loadAllData()
    }
  }, 900000) // 15 minutes
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

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Status indicator colors */
.bg-green-400 {
  background-color: #4ade80;
}

.bg-yellow-400 {
  background-color: #facc15;
}

.text-green-400 {
  color: #4ade80;
}

.text-yellow-400 {
  color: #facc15;
}

.text-red-400 {
  color: #f87171;
}

.text-gray-400 {
  color: #9ca3af;
}

/* Modal backdrop */
.bg-black.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Grid layout responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .grid-cols-1.md\:grid-cols-2.xl\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Additional responsive adjustments */
@media (max-width: 640px) {
  .p-6 {
    padding: 1rem;
  }
  
  .gap-6 {
    gap: 1rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
}
</style>