<!-- components/apiary/ApiaryDetailsAlertsTab.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Alerts & Notifications</h2>
      <button 
        @click="refreshAlerts" 
        :disabled="loadingAlerts"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
      >
        <svg v-if="loadingAlerts" class="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"/>
        </svg>
        <span>{{ loadingAlerts ? 'Loading...' : 'Refresh' }}</span>
      </button>
    </div>

    <!-- Alert Summary Cards -->
    <AlertSummaryCards
      :critical-count="criticalAlertsCount"
      :warning-count="warningAlertsCount"
      :info-count="infoAlertsCount"
      :resolved-count="resolvedTodayCount"
    />

    <!-- Filter Controls for Alerts -->
    <div class="bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
      <!-- Mobile: Collapsible Filters -->
      <div class="sm:hidden">
        <button 
          @click="showMobileFilters = !showMobileFilters"
          class="w-full flex items-center justify-between text-sm font-medium text-gray-300 mb-3"
        >
          <span>Filters & Search</span>
          <svg 
            class="w-4 h-4 transform transition-transform" 
            :class="{ 'rotate-180': showMobileFilters }"
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
          </svg>
        </button>
        
        <div v-show="showMobileFilters" class="space-y-3">
          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Status</label>
            <select 
              v-model="selectedStatus" 
              @change="fetchAlerts"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active Alerts</option>
              <option value="resolved">Alert History</option>
              <option value="all">All Alerts</option>
            </select>
          </div>

          <!-- Severity Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Severity</label>
            <select 
              v-model="selectedSeverity" 
              @change="fetchAlerts"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Desktop: Horizontal Filters -->
      <div class="hidden sm:flex flex-wrap items-center gap-4">
        <!-- Status Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-300">Status:</label>
          <select 
            v-model="selectedStatus" 
            @change="fetchAlerts"
            class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active Alerts</option>
            <option value="resolved">Alert History</option>
            <option value="all">All Alerts</option>
          </select>
        </div>

        <!-- Severity Filter -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-300">Severity:</label>
          <select 
            v-model="selectedSeverity" 
            @change="fetchAlerts"
            class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Alerts List -->
    <AlertList
      :alerts="filteredAlerts"
      :empty-title="filteredAlerts.length === 0 && alerts.length > 0 ? 'No Alerts Match Your Filters' : 'No Active Alerts'"
      :empty-message="filteredAlerts.length === 0 && alerts.length > 0 ? 'Try adjusting your filters to find the alerts you\'re looking for.' : 'Your apiary is running smoothly!'"
      @resolve="openResolveModal"
    />

    <!-- Resolve Alert Modal -->
    <div v-if="showResolveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Resolve Alert</h3>
              <p class="text-sm text-gray-400">{{ selectedAlert?.title }}</p>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Resolution Notes (Optional)</label>
            <textarea
              v-model="resolveForm.notes"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              placeholder="Add any notes about how this alert was resolved..."
            ></textarea>
          </div>
          
          <div class="flex gap-3">
            <button 
              @click="closeResolveModal"
              class="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="resolveAlert"
              :disabled="resolvingAlert"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ resolvingAlert ? 'Resolving...' : 'Resolve Alert' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import AlertList from '~/components/alert/AlertList.vue'
import AlertSummaryCards from '~/components/alert/AlertSummaryCards.vue'

// Props
const props = defineProps({
  apiaryId: {
    type: [String, Number],
    required: true
  },
  hives: {
    type: Array,
    default: () => []
  }
})

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loadingAlerts = ref(false)
const alerts = ref([])
const selectedStatus = ref('active')
const selectedSeverity = ref('')
const showMobileFilters = ref(false)
const showResolveModal = ref(false)
const selectedAlert = ref(null)
const resolvingAlert = ref(false)
const resolveForm = ref({
  notes: ''
})

// Computed Properties
const hiveIds = computed(() => props.hives.map(hive => hive.id))

const activeAlerts = computed(() => alerts.value.filter(alert => !alert.resolved))
const resolvedAlerts = computed(() => alerts.value.filter(alert => alert.resolved))

const criticalAlertsCount = computed(() => activeAlerts.value.filter(alert => alert.severity === 'critical').length)
const warningAlertsCount = computed(() => activeAlerts.value.filter(alert => alert.severity === 'warning').length)
const infoAlertsCount = computed(() => activeAlerts.value.filter(alert => alert.severity === 'info').length)

const resolvedTodayCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return resolvedAlerts.value.filter(alert => 
    alert.resolved_at && new Date(alert.resolved_at) >= today
  ).length
})

const filteredAlerts = computed(() => {
  let filtered = alerts.value

  // Filter by status
  if (selectedStatus.value === 'active') {
    filtered = filtered.filter(alert => !alert.resolved)
  } else if (selectedStatus.value === 'resolved') {
    filtered = filtered.filter(alert => alert.resolved)
  }

  // Filter by severity
  if (selectedSeverity.value) {
    filtered = filtered.filter(alert => alert.severity === selectedSeverity.value)
  }

  return filtered
})

// Helper Functions
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Alert Functions
const fetchAlerts = async () => {
  if (!user.value || hiveIds.value.length === 0) return
  
  loadingAlerts.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    const queryParams = {
      status: selectedStatus.value,
      limit: 200
    }

    if (selectedSeverity.value) {
      queryParams.severity = selectedSeverity.value
    }
    
    const response = await $fetch('/api/alerts', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: queryParams
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.data) {
      // Filter alerts to only show those from hives in this apiary
      alerts.value = response.data.filter(alert => 
        hiveIds.value.includes(alert.hive_id)
      )
    }
  } catch (err) {
    console.error('Error fetching alerts:', err)
    alerts.value = []
  } finally {
    loadingAlerts.value = false
  }
}

const refreshAlerts = async () => {
  await fetchAlerts()
}

const openResolveModal = (alert) => {
  selectedAlert.value = alert
  resolveForm.value.notes = ''
  showResolveModal.value = true
}

const closeResolveModal = () => {
  showResolveModal.value = false
  selectedAlert.value = null
  resolveForm.value.notes = ''
}

const resolveAlert = async () => {
  if (!selectedAlert.value || !user.value) return
  
  resolvingAlert.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/alerts/${selectedAlert.value.id}/resolve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        resolved_notes: resolveForm.value.notes?.trim() || null
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (response.success && response.data) {
      // Update local state with the resolved alert data
      const alertIndex = alerts.value.findIndex(a => a.id === selectedAlert.value.id)
      if (alertIndex !== -1) {
        alerts.value[alertIndex] = { ...alerts.value[alertIndex], ...response.data }
      }
      
      closeResolveModal()
      
      // Refresh alerts if we're viewing active alerts only
      if (selectedStatus.value === 'active') {
        await fetchAlerts()
      }
    } else {
      throw new Error('Failed to resolve alert')
    }
  } catch (err) {
    console.error('Error resolving alert:', err)
    alert('Failed to resolve alert. Please try again.')
  } finally {
    resolvingAlert.value = false
  }
}

// Expose computed properties and functions for parent component
defineExpose({
  activeAlertsCount: computed(() => activeAlerts.value.length),
  criticalAlertsCount,
  warningAlertsCount,
  infoAlertsCount,
  fetchAlerts,
  refreshAlerts
})

// Lifecycle
onMounted(() => {
  if (hiveIds.value.length > 0) {
    fetchAlerts()
  }
})

// Watch for hive changes
watch(() => props.hives, (newHives) => {
  if (newHives.length > 0) {
    fetchAlerts()
  }
}, { deep: true })
</script>