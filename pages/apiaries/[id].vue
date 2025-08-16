<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="totalActiveAlertsCount" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-red-400 mb-4">{{ error }}</div>
        <button @click="loadData" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Try Again
        </button>
      </div>

      <!-- Apiary Management Center -->
      <div v-else-if="apiary">
        <!-- Breadcrumb Navigation -->
        <nav class="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <NuxtLink to="/apiaries" class="hover:text-white transition-colors">My Apiaries</NuxtLink>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
          </svg>
          <span class="text-white">{{ apiary.name }}</span>
        </nav>

        <!-- Header Section with Edit Button -->
        <ApiaryHeaderCard
          :apiary="apiary"
          :health-score="healthScore"
          :is-live="isLive"
          :has-online-hub="hasOnlineHub"
          :refreshing="refreshing"
          :last-activity="getLastActivity()"
          :weather-text="'22°C, Sunny'"
          @refresh="refreshData"
          @edit-apiary="showEditApiaryModal = true"
          @delete-apiary="showDeleteConfirmModal = true"
        />

        <!-- Main Management Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-700">
            <nav class="flex space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                  'flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                ]"
              >
                <component :is="tab.icon" class="w-4 h-4" />
                {{ tab.name }}
                <span v-if="tab.badge" :class="[
                  'px-2 py-1 text-xs rounded-full',
                  tab.badgeClass || 'bg-gray-700 text-gray-300'
                ]">
                  {{ tab.badge }}
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="space-y-6">
          <!-- Hives Overview Tab -->
          <div v-if="activeTab === 'hives'">
            <HiveManagementTab
              :hives="apiaryHives"
              :can-add="canAddHive"
              :subscription="subscription"
              :current-usage="currentUsage"
              :upgrade-message="upgradeMessage"
              @add-hive="showAddHiveModal = true"
            />
          </div>

          <!-- Connectivity Hub Tab -->
          <div v-if="activeTab === 'connectivity'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Hub & Sensor Units</h2>
              <div class="flex gap-2">
                <button 
                  v-if="!apiary.hub"
                  @click="showAddHubModal = true"
                  class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 694 825">
                    <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
                  </svg>
                  Add Hub
                </button>
              </div>
            </div>

            <!-- Hub Status -->
            <div v-if="apiary.hub" class="mb-6">
              <ApiaryHubCard
                :hub="apiary.hub"
                @click="navigateToHubDetails"
              />
            </div>

            <!-- No Hub State -->
            <div v-if="!apiary.hub" class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" viewBox="0 0 694 825" fill="currentColor">
                <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z" opacity="0.5"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-300 mb-2">No Hub Assigned</h3>
              <p class="text-gray-400 mb-4">This apiary needs a hub to enable sensor data collection and monitoring.</p>
              <button 
                @click="showAddHubModal = true"
                class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg transition-colors"
              >
                Add Hub
              </button>
            </div>
          </div>

          <!-- Alerts & Notifications Tab -->
          <div v-if="activeTab === 'alerts'">
            <ApiaryDetailsAlertsTab
              ref="alertsTabRef"
              :apiary-id="apiary.id"
              :hives="apiaryHives"
            />
          </div>

          <!-- Live Data Tab -->
          <div v-if="activeTab === 'data'">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Live Data Stream</h2>
            </div>

            <!-- Empty Live Data State -->
            <div class="text-center py-12 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <h3 class="text-lg font-medium text-gray-300 mb-2">Live Data Coming Soon</h3>
              <p class="text-gray-400 mb-4">Real-time sensor data visualization will be available here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddHiveModal
      :show="showAddHiveModal"
      :creating="false"
      :subscription="subscription"
      :current-usage="currentUsage"
      :can-add="canAddHive"
      :upgrade-message="upgradeMessage"
      @close="showAddHiveModal = false"
      @create="handleHiveAdded"
    />

    <AddHubModal
      :show="showAddHubModal"
      :apiaries="[apiary]"
      :selected-apiary-id="apiary?.id"
      @close="showAddHubModal = false"
      @success="handleHubAdded"
    />

    <!-- Edit Apiary Modal Component -->
    <EditApiaryModal
      :show="showEditApiaryModal"
      :apiary="apiary"
      @close="showEditApiaryModal = false"
      @success="handleApiaryUpdated"
    />

    <!-- Delete Apiary Modal Component -->
    <DeleteApiaryModal
      :show="showDeleteConfirmModal"
      :apiary="apiary"
      :deleting="deletingApiary"
      :hive-count="apiaryHives.length"
      @close="showDeleteConfirmModal = false"
      @delete="handleDeleteApiary"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import AddHiveModal from '~/components/hive/AddHiveModal.vue'
import ApiaryHubCard from '~/components/apiary/ApiaryHubCard.vue'
import AddHubModal from '~/components/hub/AddHubModal.vue'
import EditApiaryModal from '~/components/apiary/EditApiaryModal.vue'
import DeleteApiaryModal from '~/components/apiary/DeleteApiaryModal.vue'
import ApiaryHeaderCard from '~/components/apiary/ApiaryHeaderCard.vue'
import ApiaryDetailsAlertsTab from '~/components/alert/ApiaryDetailsAlertsTab.vue'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Page Metadata
definePageMeta({
  title: 'Apiary Management - BeeVibe Dashboard',
  middleware: ['auth']
})

// State
const loading = ref(true)
const error = ref(null)
const refreshing = ref(false)
const deletingApiary = ref(false)
const apiary = ref(null)

// UI State
const activeTab = ref('hives')

// Modal State
const showAddHiveModal = ref(false)
const showAddHubModal = ref(false)
const showEditApiaryModal = ref(false)
const showDeleteConfirmModal = ref(false)

// Component Refs
const alertsTabRef = ref(null)

// Independent alert state for badge display
const alertCounts = ref({
  active: 0,
  critical: 0,
  warning: 0,
  info: 0
})

// Data from composables
const { 
  hivesWithSensorData, 
  refreshData: refreshHiveData
} = useHiveData()

const { subscription, loadSubscription } = useSubscription()

// Computed property to get hives for this specific apiary
const apiaryHives = computed(() => {
  if (!apiary.value?.id) return []
  return hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.value.id)
})

// Computed for hive management
const currentUsage = computed(() => ({
  hives: apiaryHives.value?.length || 0,
  sensors: totalSensors.value
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

// Alert counts - use independent counts as fallback when alerts tab isn't mounted
const totalActiveAlertsCount = computed(() => {
  return alertsTabRef.value?.activeAlertsCount || alertCounts.value.active
})

const criticalAlertsCount = computed(() => {
  return alertsTabRef.value?.criticalAlertsCount || alertCounts.value.critical
})

// Tab Configuration
const tabs = computed(() => [
  {
    id: 'hives',
    name: 'Hives',
    icon: 'svg',
    badge: apiaryHives.value.length,
    badgeClass: apiaryHives.value.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
  },
  {
    id: 'connectivity',
    name: 'Hub & Units',
    icon: 'svg',
    badge: apiary.value?.hub ? (hasOnlineHub.value ? 'ONLINE' : 'OFFLINE') : 'NO HUB',
    badgeClass: apiary.value?.hub ? (hasOnlineHub.value ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-600 text-white'
  },
  {
    id: 'alerts',
    name: 'Alerts',
    icon: 'svg',
    badge: totalActiveAlertsCount.value > 0 ? totalActiveAlertsCount.value : null,
    badgeClass: criticalAlertsCount.value > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-yellow-600 text-white'
  },
  {
    id: 'data',
    name: 'Live Data',
    icon: 'svg',
    badge: isLive.value ? 'LIVE' : null,
    badgeClass: 'bg-green-600 text-white animate-pulse'
  }
])

// Computed Properties
const healthScore = computed(() => {
  return calculateHealthScore()
})

const hasOnlineHub = computed(() => {
  return apiary.value?.hub && isHubOnline(apiary.value.hub)
})

const isLive = computed(() => {
  return hasOnlineHub.value
})

const totalSensors = computed(() => {
  return apiaryHives.value.reduce((total, hive) => total + (hive.sensors?.length || 0), 0)
})

// Helper Functions
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Independent function to load alert counts for badge display
const loadAlertCounts = async () => {
  if (!user.value || !apiary.value?.id) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: {
        status: 'active',
        limit: 200
      }
    })
    
    if (response.success && response.data) {
      // Filter alerts for this apiary's hives
      const apiaryAlerts = response.data.filter(alert => 
        apiaryHives.value.some(hive => hive.id === alert.hive_id)
      )
      
      // Calculate counts
      alertCounts.value = {
        active: apiaryAlerts.length,
        critical: apiaryAlerts.filter(a => a.severity === 'critical').length,
        warning: apiaryAlerts.filter(a => a.severity === 'warning').length,
        info: apiaryAlerts.filter(a => a.severity === 'info').length
      }
    }
  } catch (err) {
    console.error('Error loading alert counts:', err)
    alertCounts.value = { active: 0, critical: 0, warning: 0, info: 0 }
  }
}

const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000
}

const calculateHealthScore = () => {
  let score = 100
  
  if (!apiary.value?.is_active) score -= 50
  if (!hasOnlineHub.value) score -= 20
  if (criticalAlertsCount.value > 0) score -= (criticalAlertsCount.value * 10)
  
  return Math.max(0, score)
}

const getLastActivity = () => {
  if (isLive.value) return 'Just now'
  if (apiary.value?.updated_at) {
    const diff = Date.now() - new Date(apiary.value.updated_at).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }
  return 'No recent activity'
}

// Navigation Functions
const navigateToHubDetails = (hub) => {
  const identifier = hub.uuid || hub.id
  navigateTo(`/hubs/${identifier}`)
}

// Event Handlers
const handleHiveAdded = () => {
  loadData()
  showAddHiveModal.value = false
}

const handleHubAdded = () => {
  loadData()
  showAddHubModal.value = false
}

const handleApiaryUpdated = () => {
  loadData()
  showEditApiaryModal.value = false
}

const handleDeleteApiary = async () => {
  deletingApiary.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    const response = await $fetch(`/api/apiaries/${apiary.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.success) {
      // Navigate back to apiaries list
      await navigateTo('/apiaries')
    } else {
      throw new Error(response.error || 'Failed to delete apiary')
    }
  } catch (err) {
    console.error('Error deleting apiary:', err)
    alert('Failed to delete apiary. Please try again.')
  } finally {
    deletingApiary.value = false
    showDeleteConfirmModal.value = false
  }
}

const refreshData = async () => {
  refreshing.value = true
  await loadData()
  
  // Load alert counts for badge display
  await loadAlertCounts()
  
  // Also refresh alerts if we're on the alerts tab
  if (activeTab.value === 'alerts' && alertsTabRef.value) {
    await alertsTabRef.value.refreshAlerts()
  }
  
  refreshing.value = false
}

// Data Loading function
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const apiaryId = route.params.id
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    // Load apiary details
    const apiaryResponse = await $fetch(`/api/apiaries/${apiaryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!apiaryResponse.data) throw new Error('Apiary not found')
    
    apiary.value = apiaryResponse.data
    
    // Load hive data with sensors using the composable
    await refreshHiveData()

    // Load hub data
    const hubsResponse = await $fetch('/api/hubs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (hubsResponse.success) {
      // Find the hub for this apiary
      const apiaryHub = hubsResponse.data.find(hub => hub.apiary_id === apiary.value.id)
      apiary.value.hub = apiaryHub || null
    }

    // Load alert counts for badge display (after hives are loaded)
    await loadAlertCounts()

  } catch (err) {
    console.error('Error loading apiary data:', err)
    error.value = err.message || 'Failed to load apiary data'
  } finally {
    loading.value = false
  }
}

// Watch for hive changes to update alert counts
watch(apiaryHives, async (newHives) => {
  if (newHives.length > 0) {
    await loadAlertCounts()
  }
}, { deep: true })

// Watch for tab changes to load alerts when needed
watch(activeTab, (newTab) => {
  if (newTab === 'alerts' && alertsTabRef.value && apiary.value) {
    alertsTabRef.value.fetchAlerts()
  }
})

// Lifecycle
onMounted(() => {
  loadData()
  loadSubscription()
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>