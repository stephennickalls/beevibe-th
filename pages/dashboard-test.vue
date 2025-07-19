<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Header with Subscription Info -->
      <div class="mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold mb-2">My Hives</h1>
            <p class="text-gray-400">Monitor your hives and sensors in real-time</p>
          </div>
          
          <!-- Subscription Status Card -->
          <div v-if="subscription" class="bg-gray-900 rounded-lg p-4 min-w-[200px]">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-400">Plan</span>
              <span class="text-sm font-semibold text-blue-400">{{ subscription.planDisplayName }}</span>
            </div>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-400">Hives:</span>
                <span :class="currentUsage.hives >= subscription.limits.max_hives && subscription.limits.max_hives !== -1 ? 'text-red-400' : 'text-gray-300'">
                  {{ currentUsage.hives }}/{{ subscription.limits.max_hives === -1 ? '∞' : subscription.limits.max_hives }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Sensors:</span>
                <span :class="currentUsage.sensors >= subscription.limits.max_sensors_total && subscription.limits.max_sensors_total !== -1 ? 'text-red-400' : 'text-gray-300'">
                  {{ currentUsage.sensors }}/{{ subscription.limits.max_sensors_total === -1 ? '∞' : subscription.limits.max_sensors_total }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade Banner -->
      <div v-if="showUpgradeBanner" class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-semibold">{{ upgradeBannerMessage.title }}</h3>
            <p class="text-sm text-blue-100">{{ upgradeBannerMessage.description }}</p>
          </div>
          <div class="flex space-x-2">
            <button @click="showUpgradeBanner = false" class="px-3 py-1 text-sm bg-white/20 rounded hover:bg-white/30 transition-colors">
              Dismiss
            </button>
            <NuxtLink to="/pricing" class="px-4 py-2 text-sm bg-white text-blue-600 rounded font-medium hover:bg-gray-100 transition-colors">
              Upgrade Now
            </NuxtLink>
          </div>
        </div>
      </div>

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

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
              <p class="text-red-300">{{ error }}</p>
              <button @click="loadAllData" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Try Again
              </button>
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
                @click="handleAddHiveClick"
                :class="[
                  'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[180px]',
                  canAddHive 
                    ? 'bg-gray-800 border-gray-600 hover:border-gray-500 hover:bg-gray-750' 
                    : 'bg-gray-850 border-gray-700 opacity-50 cursor-not-allowed'
                ]"
              >
                <div class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-lg mb-2 text-gray-300">Add New Hive</h3>
                <p class="text-gray-400 text-sm text-center">
                  {{ canAddHive ? 'Click to add a new hive to your monitoring network' : `Upgrade to add more hives (${currentUsage.hives}/${subscription?.limits.max_hives} used)` }}
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

          <!-- Add Sensor Button -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <h3 class="font-semibold mb-3">Quick Actions</h3>
            <button 
              @click="handleAddSensor"
              :disabled="!canAddSensor"
              :class="[
                'w-full p-3 rounded-lg border-2 border-dashed transition-colors text-left',
                canAddSensor 
                  ? 'border-green-500 hover:border-green-400 hover:bg-green-500/10' 
                  : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
              ]"
            >
              <div class="flex items-center">
                <div class="p-2 bg-green-600 rounded-lg mr-3">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z"/>
                    <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z"/>
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-sm">Add Sensor</h4>
                  <p class="text-xs text-gray-400">
                    {{ canAddSensor ? 'Create a new sensor' : `Upgrade needed (${currentUsage.sensors}/${subscription?.limits.max_sensors_total} used)` }}
                  </p>
                </div>
              </div>
            </button>
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

      <!-- Add New Hive Modal -->
      <AddHiveModal
        :show="showAddHiveModal"
        :creating="addingHive"
        :subscription="subscription"
        :current-usage="currentUsage"
        @close="showAddHiveModal = false"
        @create="handleAddHive"
      />

      <!-- Edit Sensor Modal (Used for adding sensors) -->
      <SensorEditModal
        :show="showEditSensorModal"
        :sensor="selectedSensor"
        :available-hives="hiveData"
        :updating="creatingSensor"
        @close="closeEditSensorModal"
        @save="handleCreateSensor"
      />

      <!-- Upgrade Modal -->
      <div v-if="showUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 class="text-xl font-semibold">Upgrade Required</h3>
            <button @click="showUpgradeModal = false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <p class="text-gray-300 mb-4">{{ upgradeModalMessage }}</p>
            
            <div class="bg-gray-700 rounded-lg p-4 mb-6">
              <h4 class="font-semibold mb-2">Your Current Plan: {{ subscription?.planDisplayName }}</h4>
              <div class="space-y-1 text-sm text-gray-300">
                <div>Hives: {{ currentUsage.hives }}/{{ subscription?.limits.max_hives === -1 ? '∞' : subscription?.limits.max_hives }}</div>
                <div>Sensors: {{ currentUsage.sensors }}/{{ subscription?.limits.max_sensors_total === -1 ? '∞' : subscription?.limits.max_sensors_total }}</div>
              </div>
            </div>

            <div class="flex space-x-4">
              <button 
                @click="showUpgradeModal = false"
                class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Maybe Later
              </button>
              <NuxtLink 
                to="/pricing"
                class="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
                @click="showUpgradeModal = false"
              >
                View Plans
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AddHiveModal from '~/components/AddHiveModal.vue'
import SensorEditModal from '~/components/SensorEditModal.vue'

// Meta
definePageMeta({
  title: 'My Hives - BeeVibe Dashboard',
  middleware: ['auth']
})

// Composables
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { subscription, loadSubscription } = useSubscription()

// Reactive data
const loading = ref(true)
const error = ref(null)
const showAddHiveModal = ref(false)
const showEditSensorModal = ref(false)
const showUpgradeBanner = ref(false)
const showUpgradeModal = ref(false)
const upgradeModalMessage = ref('')

// Loading states
const addingHive = ref(false)
const creatingSensor = ref(false)

// Data refs
const hiveData = ref([])
const alerts = ref([])
const sensors = ref([])
const selectedSensor = ref(null)
const currentUsage = ref({
  hives: 0,
  sensors: 0
})

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

const canAddHive = computed(() => {
  if (!subscription.value) return false
  const maxHives = subscription.value.limits.max_hives
  return maxHives === -1 || currentUsage.value.hives < maxHives
})

const canAddSensor = computed(() => {
  if (!subscription.value) return false
  const maxSensors = subscription.value.limits.max_sensors_total
  return maxSensors === -1 || currentUsage.value.sensors < maxSensors
})

const upgradeBannerMessage = computed(() => {
  if (!subscription.value) return { title: '', description: '' }
  
  const hivesAtLimit = currentUsage.value.hives >= subscription.value.limits.max_hives && subscription.value.limits.max_hives !== -1
  const sensorsAtLimit = currentUsage.value.sensors >= subscription.value.limits.max_sensors_total && subscription.value.limits.max_sensors_total !== -1
  
  if (hivesAtLimit && sensorsAtLimit) {
    return {
      title: 'You\'ve reached your plan limits',
      description: 'Upgrade to add more hives and sensors to your monitoring system.'
    }
  } else if (hivesAtLimit) {
    return {
      title: 'Hive limit reached',
      description: `You've used all ${subscription.value.limits.max_hives} hives on your ${subscription.value.planDisplayName} plan.`
    }
  } else if (sensorsAtLimit) {
    return {
      title: 'Sensor limit reached',
      description: `You've used all ${subscription.value.limits.max_sensors_total} sensors on your ${subscription.value.planDisplayName} plan.`
    }
  }
  
  return { title: '', description: '' }
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
  navigateTo(`/hives/${hive.uuid || hive.id}`)
}

const handleAddHiveClick = () => {
  if (canAddHive.value) {
    showAddHiveModal.value = true
  } else {
    upgradeModalMessage.value = `You've reached the hive limit for your ${subscription.value?.planDisplayName} plan. Upgrade to add more hives.`
    showUpgradeModal.value = true
  }
}

const handleAddSensor = () => {
  if (canAddSensor.value) {
    // Create empty sensor for the edit modal
    selectedSensor.value = {
      sensor_type: '',
      name: '',
      model: '',
      battery_level: 100,
      is_online: true,
      hive_id: ''
    }
    showEditSensorModal.value = true
  } else {
    upgradeModalMessage.value = `You've reached the sensor limit for your ${subscription.value?.planDisplayName} plan. Upgrade to add more sensors.`
    showUpgradeModal.value = true
  }
}

const closeEditSensorModal = () => {
  selectedSensor.value = null
  showEditSensorModal.value = false
  creatingSensor.value = false
}

const handleAddHive = async (hiveData) => {
  addingHive.value = true
  
  try {
    const response = await $fetch('/api/hives', {
      method: 'POST',
      body: {
        name: hiveData.name.trim(),
        description: hiveData.description.trim() || hiveData.name.trim(),
        latitude: hiveData.latitude ? parseFloat(hiveData.latitude) : null,
        longitude: hiveData.longitude ? parseFloat(hiveData.longitude) : null,
        installation_date: hiveData.installation_date,
        is_active: true
      }
    })
    
    if (response && response.data) {
      // Add to local state
      hiveData.value.push(response.data)
      currentUsage.value.hives++
      
      showAddHiveModal.value = false
      
      // Refresh data to ensure consistency
      await fetchHiveData()
    }
  } catch (error) {
    console.error('Failed to add hive:', error)
    alert('Failed to add hive. Please try again.')
  } finally {
    addingHive.value = false
  }
}

const handleCreateSensor = async (sensorData) => {
  creatingSensor.value = true
  
  try {
    const response = await $fetch('/api/sensors', {
      method: 'POST',
      body: sensorData
    })
    
    if (response && response.data) {
      // Update current usage
      currentUsage.value.sensors++
      
      // Close modal
      closeEditSensorModal()
      
      // Refresh the dashboard data to show the new sensor
      await loadAllData()
    }
  } catch (error) {
    console.error('Failed to create sensor:', error)
    alert('Failed to create sensor. Please try again.')
  } finally {
    creatingSensor.value = false
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
    const response = await $fetch('/api/hives')
    if (response && response.data) {
      hiveData.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch hive data:', error)
  }
}

const fetchAlerts = async () => {
  try {
    const response = await $fetch('/api/alerts')
    if (response && response.data) {
      alerts.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    // Continue without alerts if endpoint doesn't exist
    alerts.value = []
  }
}

const fetchSensors = async () => {
  try {
    const response = await $fetch('/api/sensors')
    if (response && response.data) {
      sensors.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch sensors:', error)
  }
}

const loadAllData = async () => {
  try {
    loading.value = true
    error.value = null

    // Load subscription first
    await loadSubscription()

    // Fetch all data
    await Promise.all([
      fetchHiveData(),
      fetchAlerts(),
      fetchSensors()
    ])

    // Update current usage
    currentUsage.value = {
      hives: hiveData.value.length,
      sensors: sensors.value.length
    }

    // Show upgrade banner if near limits
    const hivesNearLimit = subscription.value && subscription.value.limits.max_hives !== -1 && 
                          currentUsage.value.hives >= subscription.value.limits.max_hives * 0.8
    const sensorsNearLimit = subscription.value && subscription.value.limits.max_sensors_total !== -1 && 
                            currentUsage.value.sensors >= subscription.value.limits.max_sensors_total * 0.8
    
    showUpgradeBanner.value = hivesNearLimit || sensorsNearLimit

  } catch (err) {
    console.error('Dashboard fetch error:', err)
    error.value = err.message || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadAllData()
  
  // Set up auto-refresh every 10 minutes
  updateInterval = setInterval(loadAllData, 600000)
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

.bg-gray-850 {
  background-color: #1f2937;
}
</style>