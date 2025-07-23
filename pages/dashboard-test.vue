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
            <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
            <p class="text-gray-400">Monitor your hives and sensors in real-time</p>
          </div>
          
          <!-- Subscription Status Card -->
          <div v-if="subscription" class="bg-gray-800 rounded-lg p-4 min-w-[200px]">
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

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
        <p class="text-red-300">{{ error }}</p>
        <button @click="fetchDashboardData" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Try Again
        </button>
      </div>

      <!-- Dashboard Content -->
      <div v-else class="space-y-6">
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-600 rounded-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-400">Total Hives</p>
                <p class="text-2xl font-bold">{{ stats.totalHives }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-600 rounded-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-400">Active Sensors</p>
                <p class="text-2xl font-bold">{{ stats.activeSensors }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-600 rounded-lg">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-400">Active Alerts</p>
                <p class="text-2xl font-bold">{{ stats.activeAlerts }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions with Limit Checks -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Add Hive Button -->
            <button 
              @click="handleAddHive"
              :disabled="!canAddHive"
              :class="[
                'p-4 rounded-lg border-2 border-dashed transition-colors text-left',
                canAddHive 
                  ? 'border-blue-500 hover:border-blue-400 hover:bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
              ]"
            >
              <div class="flex items-center">
                <div class="p-2 bg-blue-600 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-medium">Add Hive</h3>
                  <p class="text-sm text-gray-400">
                    {{ canAddHive ? 'Create a new hive' : `Upgrade to add more hives (${currentUsage.hives}/${subscription?.limits.max_hives} used)` }}
                  </p>
                </div>
              </div>
            </button>

            <!-- Add Sensor Button -->
            <button 
              @click="handleAddSensor"
              :disabled="!canAddSensor"
              :class="[
                'p-4 rounded-lg border-2 border-dashed transition-colors text-left',
                canAddSensor 
                  ? 'border-green-500 hover:border-green-400 hover:bg-green-500/10' 
                  : 'border-gray-600 bg-gray-800 cursor-not-allowed opacity-50'
              ]"
            >
              <div class="flex items-center">
                <div class="p-2 bg-green-600 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z"/>
                    <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-medium">Add Sensor</h3>
                  <p class="text-sm text-gray-400">
                    {{ canAddSensor ? 'Create a new sensor' : `Upgrade to add more sensors (${currentUsage.sensors}/${subscription?.limits.max_sensors_total} used)` }}
                  </p>
                </div>
              </div>
            </button>

            <!-- View Analytics -->
            <NuxtLink 
              to="/analytics" 
              class="p-4 rounded-lg border-2 border-dashed border-purple-500 hover:border-purple-400 hover:bg-purple-500/10 transition-colors"
            >
              <div class="flex items-center">
                <div class="p-2 bg-purple-600 rounded-lg">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-medium">View Analytics</h3>
                  <p class="text-sm text-gray-400">Monitor hive performance</p>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Hives -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Your Hives</h2>
            <NuxtLink to="/hives" class="text-blue-400 hover:text-blue-300 text-sm">View All</NuxtLink>
          </div>

          <div v-if="recentHives.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <h3 class="text-lg font-semibold mb-2">No Hives Yet</h3>
            <p class="text-gray-400 mb-4">Create your first hive to start monitoring your bees</p>
            <button 
              @click="handleAddHive"
              :disabled="!canAddHive"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ canAddHive ? 'Create Your First Hive' : 'Upgrade to Create Hives' }}
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="hive in recentHives" 
              :key="hive.id"
              class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
            >
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-semibold">{{ hive.name }}</h3>
                <span class="text-xs bg-green-600 px-2 py-1 rounded-full">Active</span>
              </div>
              
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-400">Sensors:</span>
                  <span :class="hive.sensor_count >= subscription?.limits.max_sensors_per_hive && subscription?.limits.max_sensors_per_hive !== -1 ? 'text-yellow-400' : 'text-gray-300'">
                    {{ hive.sensor_count }}/{{ subscription?.limits.max_sensors_per_hive === -1 ? '∞' : subscription?.limits.max_sensors_per_hive }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Last Reading:</span>
                  <span class="text-gray-300">{{ formatDate(hive.last_reading_at) }}</span>
                </div>
              </div>

              <div class="mt-4 flex space-x-2">
                <NuxtLink 
                  :to="`/hives/${hive.id}`"
                  class="flex-1 px-3 py-2 bg-blue-600 text-white text-center rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Alerts -->
        <div class="bg-gray-900 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Recent Alerts</h2>
            <NuxtLink to="/alerts" class="text-blue-400 hover:text-blue-300 text-sm">View All</NuxtLink>
          </div>

          <div v-if="recentAlerts.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <h3 class="text-lg font-semibold mb-2">All Clear!</h3>
            <p class="text-gray-400">No active alerts for your hives</p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="alert in recentAlerts" 
              :key="alert.id"
              class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
            >
              <div class="flex items-center">
                <div class="p-2 bg-yellow-600 rounded-lg mr-3">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-medium">{{ alert.title }}</p>
                  <p class="text-sm text-gray-400">{{ alert.hive_name }} • {{ formatDate(alert.created_at) }}</p>
                </div>
              </div>
              <span class="text-xs bg-yellow-600 px-2 py-1 rounded-full">{{ alert.severity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Hive Modal -->
    <AddHiveModal
      :show="showAddHiveModal"
      :creating="creatingHive"
      :subscription="subscription"
      :current-usage="currentUsage"
      @close="showAddHiveModal = false"
      @create="handleCreateHive"
    />

    <!-- Add Sensor Modal -->
    <AddSensorModal
      :show="showAddSensorModal"
      :creating="creatingSensor"
      :available-hives="recentHives"
      :subscription="subscription"
      :current-usage="currentUsage"
      @close="showAddSensorModal = false"
      @create="handleCreateSensor"
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AddHiveModal from '~/components/AddHiveModal.vue'
import AddSensorModal from '~/components/AddSensorModal.vue'

// Meta with auth middleware
definePageMeta({
  title: 'Dashboard - BeeVibe',
  middleware: ['auth']
})

// Composables
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { subscription, loadSubscription } = useSubscription()

// Reactive data
const loading = ref(true)
const error = ref(null)
const stats = ref({
  totalHives: 0,
  activeSensors: 0,
  activeAlerts: 0,
  totalReadings: 0
})
const recentHives = ref([])
const recentAlerts = ref([])
const activeAlerts = ref([])
const currentUsage = ref({
  hives: 0,
  sensors: 0
})

// UI State
const showUpgradeBanner = ref(false)
const showUpgradeModal = ref(false)
const showAddHiveModal = ref(false)
const showAddSensorModal = ref(false)
const upgradeModalMessage = ref('')

// Loading states
const creatingHive = ref(false)
const creatingSensor = ref(false)

// Computed properties
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

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

const handleAddHive = () => {
  if (canAddHive.value) {
    showAddHiveModal.value = true
  } else {
    upgradeModalMessage.value = `You've reached the hive limit for your ${subscription.value?.planDisplayName} plan. Upgrade to add more hives.`
    showUpgradeModal.value = true
  }
}

const handleAddSensor = () => {
  if (canAddSensor.value) {
    showAddSensorModal.value = true
  } else {
    upgradeModalMessage.value = `You've reached the sensor limit for your ${subscription.value?.planDisplayName} plan. Upgrade to add more sensors.`
    showUpgradeModal.value = true
  }
}

const handleCreateHive = async (hiveData) => {
  creatingHive.value = true
  
  try {
    // Get auth token for API calls
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('No valid session found')
    }

    const authHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }

    const response = await $fetch('/api/hives', {
      method: 'POST',
      headers: authHeaders,
      body: hiveData
    })

    if (response.data) {
      // Add the new hive to the list
      recentHives.value.unshift(response.data)
      
      // Update stats
      stats.value.totalHives++
      currentUsage.value.hives++
      
      // Close modal
      showAddHiveModal.value = false
      
      // Show success message or redirect
      console.log('Hive created successfully:', response.data)
    }
  } catch (err) {
    console.error('Error creating hive:', err)
    // You might want to show an error message to the user
    alert('Failed to create hive. Please try again.')
  } finally {
    creatingHive.value = false
  }
}

const handleCreateSensor = async (sensorData) => {
  creatingSensor.value = true
  
  try {
    // Get auth token for API calls
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('No valid session found')
    }

    const authHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }

    const response = await $fetch('/api/sensors', {
      method: 'POST',
      headers: authHeaders,
      body: sensorData
    })

    if (response.data) {
      // Update stats
      stats.value.activeSensors++
      currentUsage.value.sensors++
      
      // Close modal
      showAddSensorModal.value = false
      
      // Show success message
      console.log('Sensor created successfully:', response.data)
      
      // Optionally refresh the dashboard data to show the new sensor
      await fetchDashboardData()
    }
  } catch (err) {
    console.error('Error creating sensor:', err)
    // You might want to show an error message to the user
    alert('Failed to create sensor. Please try again.')
  } finally {
    creatingSensor.value = false
  }
}

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null

    if (!user.value) {
      throw new Error('User not authenticated')
    }

    // Load subscription first
    await loadSubscription()

    // Get auth token for API calls
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('No valid session found')
    }

    const authHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }

    // Fetch dashboard data
    const [hivesResponse, sensorsResponse] = await Promise.all([
      $fetch('/api/hives', { headers: authHeaders }),
      $fetch('/api/sensors', { headers: authHeaders })
    ])

    const hives = hivesResponse.data || []
    const sensors = sensorsResponse.data || []

    // Update stats
    stats.value = {
      totalHives: hives.length,
      activeSensors: sensors.filter(s => s.is_online).length,
      activeAlerts: 0, // TODO: Implement alerts
      totalReadings: 0 // TODO: Calculate from readings
    }

    // Update current usage
    currentUsage.value = {
      hives: hives.length,
      sensors: sensors.length
    }

    // Set recent data (latest 3 hives)
    recentHives.value = hives.slice(0, 3)
    recentAlerts.value = [] // TODO: Implement alerts
    activeAlerts.value = [] // TODO: Implement alerts

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
  await fetchDashboardData()
})
</script>

<style scoped>
.hover\:bg-gray-750:hover {
  background-color: #374151;
}
</style>

