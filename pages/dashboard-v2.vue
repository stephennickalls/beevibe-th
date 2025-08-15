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

      <!-- Dashboard Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
            <p class="text-gray-400">Monitor your apiaries and hive health</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </div>

      <!-- Summary Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Apiaries Card -->
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-blue-400 mb-1">{{ totalApiaries }}</div>
              <div class="text-sm text-gray-400">Total Apiaries</div>
            </div>
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Hives Card -->
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-green-400 mb-1">{{ totalHives }}</div>
              <div class="text-sm text-gray-400">Total Hives</div>
            </div>
            <div class="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
                <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z" fill="currentColor"/>
                <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Sensors Card -->
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-purple-400 mb-1">{{ totalSensorCount }}</div>
              <div class="text-sm text-gray-400">Total Sensors</div>
            </div>
            <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Alerts Card -->
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-2xl font-bold text-red-400 mb-1">{{ activeAlerts.length }}</div>
              <div class="text-sm text-gray-400">Active Alerts</div>
            </div>
            <div class="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
          </div>
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

      <!-- Loading State -->
      <LoadingState v-if="loading" message="Loading your apiaries..." />

      <!-- No Apiaries State -->
      <div v-else-if="apiariesWithHiveData.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <h3 class="text-lg font-semibold mb-2">No Apiaries Yet</h3>
        <p class="text-gray-400 mb-4">Create your first apiary to start monitoring your beehives</p>
        <button 
          @click="handleCreateApiary"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Your First Apiary
        </button>
      </div>

      <!-- Collapsible Apiaries List -->
      <div v-else class="space-y-4">
        <CollapsibleApiaryCard
          v-for="apiary in apiariesWithHiveData"
          :key="apiary.id"
          :apiary="apiary"
          :alerts="getApiaryAlerts(apiary.id)"
          :is-expanded="expandedApiaries[apiary.id] || false"
          @toggle="toggleApiary(apiary.id)"
          @apiary-click="viewApiaryDetails"
          @hive-click="viewHiveDetails"
        />
      </div>

      <!-- Modals -->
      <CreateApiaryModal 
        :show="showCreateApiaryModal"
        @close="showCreateApiaryModal = false"
        @created="handleApiaryCreated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CollapsibleApiaryCard from '~/components/apiary/CollapsibleApiaryCard.vue'
import CreateApiaryModal from '~/components/apiary/CreateApiaryModal.vue'
import SystemStatusStrip from '~/components/SystemStatusStrip.vue'
import LoadingState from '~/components/LoadingState.vue'

// Meta
definePageMeta({
  title: 'Dashboard - BeeVibe',
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
  lastUpdateTime,
  totalSensorCount,
  onlineSensorCount,
  lowBatterySensorCount,
  refreshData,
  clearError
} = useHiveData()

// State management
const showCreateApiaryModal = ref(false)
const alerts = ref([])
const apiaries = ref([])
const expandedApiaries = ref({}) // Track which apiaries are expanded

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Computed properties
const totalApiaries = computed(() => apiaries.value.length)
const totalHives = computed(() => hivesWithSensorData.value?.length || 0)

const apiariesWithHiveData = computed(() => {
  if (!apiaries.value.length || !hivesWithSensorData.value.length) {
    return apiaries.value.map(apiary => ({
      ...apiary,
      hives: [],
      hive_count: 0,
      sensor_count: 0,
      alert_count: 0
    }))
  }

  return apiaries.value.map(apiary => {
    // Get hives for this apiary
    const apiaryHives = hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.id)
    
    // Calculate stats
    const sensorCount = apiaryHives.reduce((total, hive) => total + (hive.sensors?.length || 0), 0)
    const alertCount = activeAlerts.value.filter(alert => 
      apiaryHives.some(hive => hive.id === alert.hive_id)
    ).length

    return {
      ...apiary,
      hives: apiaryHives,
      hive_count: apiaryHives.length,
      sensor_count: sensorCount,
      alert_count: alertCount
    }
  })
})

// Alert-related computed properties
const activeAlerts = computed(() => {
  return alerts.value
    .filter(alert => !alert.resolved)
    .map(alert => ({
      ...alert,
      hiveName: hivesWithSensorData.value.find(h => h.id === alert.hive_id)?.name || 'Unknown Hive'
    }))
    .sort((a, b) => {
      const severityOrder = { 'critical': 3, 'warning': 2, 'info': 1 }
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      if (severityDiff !== 0) return severityDiff
      return new Date(b.created_at) - new Date(a.created_at)
    })
})

// Helper functions
const toggleApiary = (apiaryId) => {
  expandedApiaries.value[apiaryId] = !expandedApiaries.value[apiaryId]
}

const getApiaryAlerts = (apiaryId) => {
  const apiaryHives = hivesWithSensorData.value.filter(hive => hive.apiary_id === apiaryId)
  return activeAlerts.value.filter(alert => 
    apiaryHives.some(hive => hive.id === alert.hive_id)
  )
}

const handleRefresh = async () => {
  if (!user.value || loading.value) return
  await Promise.all([
    refreshData(),
    fetchAlerts(),
    fetchApiaries()
  ])
}

const handleCreateApiary = () => {
  showCreateApiaryModal.value = true
}

const handleApiaryCreated = async () => {
  showCreateApiaryModal.value = false
  await fetchApiaries()
}

const viewApiaryDetails = (apiary) => {
  navigateTo(`/apiaries/${apiary.uuid || apiary.id}`)
}

const viewHiveDetails = (hive) => {
  navigateTo(`/hives/${hive.uuid || hive.id}`)
}

// Data fetching functions
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
  }
}

const fetchApiaries = async () => {
  if (!user.value) return
  
  try {
    const token = await getAuthToken()
    if (!token) return

    const response = await $fetch('/api/apiaries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      apiaries.value = response.data
    }
  } catch (err) {
    console.error('Failed to fetch apiaries:', err)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAlerts(),
    fetchApiaries()
  ])
})
</script>

<style scoped>
/* Pulse animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .p-6 {
    padding: 1rem;
  }
  
  .gap-6 {
    gap: 1rem;
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>