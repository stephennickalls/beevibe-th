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

      <!-- Summary Stats -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-lg font-bold text-blue-400">{{ totalApiaries }}</div>
            <div class="text-xs text-gray-400">Apiaries</div>
          </div>
          <div>
            <div class="text-lg font-bold text-green-400">{{ totalHives }}</div>
            <div class="text-xs text-gray-400">Hives</div>
          </div>
          <div>
            <div class="text-lg font-bold text-purple-400">{{ totalSensorCount }}</div>
            <div class="text-xs text-gray-400">Sensors</div>
          </div>
          <div>
            <div class="text-lg font-bold text-red-400">{{ activeAlerts.length }}</div>
            <div class="text-xs text-gray-400">Alerts</div>
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

      <!-- Quick Actions -->
      <div class="bg-gray-900 rounded-2xl p-6 mt-6">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button class="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center">
            <svg class="w-6 h-6 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            <div class="text-sm font-medium">View Analytics</div>
          </button>
          
          <button class="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-center">
            <svg class="w-6 h-6 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
            </svg>
            <div class="text-sm font-medium">Add Apiary</div>
          </button>
          
          <button class="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-center">
            <svg class="w-6 h-6 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414z"/>
            </svg>
            <div class="text-sm font-medium">Add Hive</div>
          </button>
          
          <button class="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-center">
            <svg class="w-6 h-6 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
            </svg>
            <div class="text-sm font-medium">Export Data</div>
          </button>
        </div>
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
import CollapsibleApiaryCard from '~/components/CollapsibleApiaryCard.vue'
import CreateApiaryModal from '~/components/CreateApiaryModal.vue'
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
    gap: 0.5rem;
  }
}
</style>