<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <SystemStatusStrip
        :online-sensors="onlineSensorCount"
        :total-sensors="totalSensorCount"
        :low-battery-sensors="lowBatterySensorCount"
        :last-update="lastUpdateTime"
        :data-sync="true"
        :show-refresh="true"
        :refreshing="loading"
        @refresh="handleRefresh"
      />

      <!-- <SubscriptionStrip
        :user="user"
        :subscription="subscription"
        :current-usage="currentUsage"
        @upgrade="navigateTo('/pricing')"
      /> -->
      
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
          <button @click="clearError" class="text-white hover:text-gray-200">
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
                {{ hivesWithSensorData.length }} {{ hivesWithSensorData.length === 1 ? 'hive' : 'hives' }} total
              </div>
            </div>

            <!-- Loading State -->
            <LoadingState v-if="loading" message="Loading your hives..." />

            <!-- Hive Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <!-- Hive Cards -->
              <HiveCard
                v-for="hive in hivesWithSensorData"
                :key="hive.id"
                :hive="hive"
                @click="navigateToHive"
              />

              <!-- Add New Hive Card -->
              <div
                @click="handleAddHiveClick"
                :class="[
                  'bg-gray-800 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[280px]',
                  canAddHive ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-750' : 'border-red-600 bg-red-900/20'
                ]"
              >
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                  canAddHive ? 'bg-gray-700' : 'bg-red-600'
                ]">
                  <svg v-if="canAddHive" class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                  </svg>
                  <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                  </svg>
                </div>
                <h3 :class="[
                  'font-semibold text-lg mb-2',
                  canAddHive ? 'text-gray-300' : 'text-red-400'
                ]">
                  {{ canAddHive ? 'Add New Hive' : 'Limit Reached' }}
                </h3>
                <p :class="[
                  'text-sm text-center',
                  canAddHive ? 'text-gray-400' : 'text-red-300'
                ]">
                  {{ canAddHive 
                    ? 'Click to add a new hive to your monitoring network' 
                    : `You've reached your ${subscription?.limits.max_hives} hive limit. Upgrade to add more.`
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Alerts -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Active Alerts -->
          <div class="bg-gray-900 rounded-2xl p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Active Alerts</h3>
              <span class="text-xs text-gray-400">{{ activeAlerts.length }} active</span>
            </div>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div v-if="activeAlerts.length === 0" class="text-center py-12 text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
                <h4 class="text-sm font-medium text-green-400 mb-1">Buzzing Along Perfectly!</h4>
                <p class="text-xs text-gray-500">Your hives are happy and healthy. The bees are doing their thing!</p>
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
        </div>
      </div>

      <!-- UNIFIED MODAL COMPONENT - Handles both Add and Upgrade states -->
      <AddHiveModal
        :show="showAddHiveModal"
        :creating="addingHive"
        :subscription="subscription"
        :current-usage="currentUsage"
        :can-add="canAddHive"
        :upgrade-message="upgradeMessage"
        @close="closeModal"
        @create="handleAddHive"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AddHiveModal from '~/components/AddHiveModal.vue'
import SubscriptionStrip from '~/components/SubscriptionStrip.vue'
import SystemStatusStrip from '~/components/SystemStatusStrip.vue'
import HiveCard from '~/components/HiveCard.vue'
import LoadingState from '~/components/LoadingState.vue'

// Meta
definePageMeta({
  title: 'My Hives - BeeVibe Dashboard',
  middleware: ['auth'] // Ensure authentication is required
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
  lastUpdateTime,
  totalSensorCount,
  onlineSensorCount,
  lowBatterySensorCount,
  loadAllData,
  refreshData,
  clearError
} = useHiveData()

// Composables for subscription
const { subscription, loadSubscription } = useSubscription()

// SIMPLIFIED STATE MANAGEMENT - Removed showUpgradeModal and upgradeModalMessage
const showAddHiveModal = ref(false)
const addingHive = ref(false)
const alerts = ref([])

// Current usage data for the modal
const currentUsage = computed(() => ({
  hives: hivesWithSensorData.value?.length || 0,
  sensors: sensorsWithLatestReadings.value?.length || 0
}))

// SUBSCRIPTION ENFORCEMENT - Computed properties for limits
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

// COMPUTED UPGRADE MESSAGE FOR MODAL
const upgradeMessage = computed(() => {
  if (!subscription.value) return ''
  const maxHives = subscription.value.limits?.max_hives || 0
  return `You've reached your hive limit of ${maxHives} hive${maxHives === 1 ? '' : 's'}. Please upgrade your plan to add more hives.`
})

// Update interval
let updateInterval

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Alert-related computed properties
const activeAlerts = computed(() => {
  return alerts.value
    .filter(alert => !alert.resolved)
    .map(alert => ({
      ...alert,
      hiveName: hivesWithSensorData.value.find(h => h.id === alert.hive_id)?.name || 'Unknown Hive'
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const criticalAlerts = computed(() => {
  return activeAlerts.value.filter(alert => alert.severity === 'critical')
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

// SIMPLIFIED CLOSE MODAL
const closeModal = () => {
  showAddHiveModal.value = false
  addingHive.value = false
}

const handleRefresh = async () => {
  if (!user.value || loading.value) return
  await Promise.all([
    refreshData(),
    fetchAlerts()
  ])
}

// SIMPLIFIED CLICK HANDLER - Always show the modal, let it handle the logic
const handleAddHiveClick = () => {
  showAddHiveModal.value = true
}

// SIMPLIFIED ADD HIVE HANDLER - Remove subscription checking
const handleAddHive = async (hiveData) => {
  if (addingHive.value || !user.value) return
  
  addingHive.value = true
  
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
      // Refresh all data to get the new hive with its relationships
      await refreshData()
      
      // Close modal
      closeModal()
    }
  } catch (err) {
    console.error('Failed to add hive:', err)
    alert(err.message || 'Failed to add hive. Please try again.')
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

// Lifecycle
onMounted(async () => {
  // Load subscription first
  await loadSubscription()
  
  // Load alerts (hive data is loaded automatically by the composable)
  await fetchAlerts()
  
  // Set up auto-refresh every 15 minutes for authenticated users
  updateInterval = setInterval(async () => {
    if (user.value && !loading.value) { // Prevent overlapping requests
      console.log('Auto-refreshing data...')
      await handleRefresh()
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