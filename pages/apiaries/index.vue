<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold mb-2">Apiaries</h1>
            <p class="text-gray-400">Manage your apiary locations and hive groups</p>
          </div>
          <button 
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Apiary</span>
          </button>
        </div>
      </div>



      <!-- Search and Filter Controls -->
      <div class="bg-gray-900 rounded-xl p-4 mb-6">
        <!-- Filter Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <button 
              @click="showFilters = !showFilters"
              class="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
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
              {{ filteredApiaries.length }} of {{ apiariesWithFullHiveData.length }} apiaries
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
        <div v-if="showFilters" class="border-t border-gray-700 pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <!-- Search -->
            <div>
              <label class="block text-sm font-medium mb-1">Search</label>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Name, description, or address..."
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <div class="relative">
                <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Hive Count Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Hive Count</label>
              <div class="relative">
                <select v-model="filterHiveCount" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Counts</option>
                  <option value="empty">No Hives (0)</option>
                  <option value="small">Small (1-3)</option>
                  <option value="medium">Medium (4-10)</option>
                  <option value="large">Large (11+)</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Alert Status Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Alert Status</label>
              <div class="relative">
                <select v-model="filterAlerts" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Alerts</option>
                  <option value="none">No Alerts</option>
                  <option value="warning">Has Warnings</option>
                  <option value="critical">Has Critical</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Location Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Location Data</label>
              <div class="relative">
                <select v-model="filterLocation" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Locations</option>
                  <option value="with-location">Has Location</option>
                  <option value="without-location">No Location</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Installation Date Filter -->
            <div>
              <label class="block text-sm font-medium mb-1">Created</label>
              <div class="relative">
                <select v-model="filterInstallDate" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="">All Dates</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>

            <!-- Sort Order -->
            <div>
              <label class="block text-sm font-medium mb-1">Sort By</label>
              <div class="relative">
                <select v-model="sortBy" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none pr-8">
                  <option value="name">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="created">Newest First</option>
                  <option value="created-desc">Oldest First</option>
                  <option value="hive-count">Most Hives</option>
                  <option value="hive-count-desc">Fewest Hives</option>
                </select>
                <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Quick Clear Filters Button -->
          <div v-if="hasActiveFilters" class="text-center">
            <button 
              @click="clearFilters" 
              class="text-blue-400 hover:text-blue-300 text-sm cursor-pointer self-end"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <div>
            <h3 class="text-red-400 font-medium">Error Loading Apiaries</h3>
            <p class="text-red-300 text-sm">{{ error }}</p>
          </div>
        </div>
        <button 
          @click="loadApiaries" 
          class="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- No Apiaries/No Results State -->
      <div v-else-if="filteredApiaries.length === 0" class="text-center py-12">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto mb-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          <div v-if="!hasActiveFilters" class="text-4xl mb-2">🏡</div>
        </div>
        <h3 class="text-xl font-semibold mb-2">
          {{ hasActiveFilters ? 'No Apiaries Match Your Filters' : 'No Apiaries Yet' }}
        </h3>
        <p class="text-gray-400 mb-6">
          {{ hasActiveFilters ? 'Try adjusting your filters to find the apiaries you\'re looking for.' : 'Create your first apiary to start organizing your hives by location' }}
        </p>
        <button 
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors mr-4"
        >
          Clear Filters
        </button>
        <button 
          @click="showCreateModal = true"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Your First Apiary
        </button>
      </div>

      <!-- Collapsible Apiaries List -->
      <div v-else class="space-y-4">
        <CollapsibleApiaryCard
          v-for="apiary in filteredApiaries"
          :key="apiary.id"
          :apiary="apiary"
          :alerts="getApiaryAlerts(apiary.id)"
          :is-expanded="expandedApiaries[apiary.id] || false"
          @toggle="toggleApiary(apiary.id)"
          @apiary-click="viewApiaryDetails"
          @hive-click="viewHiveDetails"
        />
      </div>
    </div>

    <!-- Create Apiary Modal with Subscription Protection -->
    <CreateApiaryModal 
      :show="showCreateModal"
      :subscription="subscription"
      :currentUsage="currentUsage"
      :canAdd="canAddApiary"
      :upgradeMessage="apiaryUpgradeMessage"
      @close="showCreateModal = false"
      @created="handleApiaryCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CollapsibleApiaryCard from '~/components/CollapsibleApiaryCard.vue'

// Meta
definePageMeta({
  title: 'Apiaries - BeeVibe Dashboard',
  middleware: ['auth']
})

// State
const apiaries = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const expandedApiaries = ref({}) // Track which apiaries are expanded

// Filter State
const showFilters = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterHiveCount = ref('')
const filterAlerts = ref('')
const filterLocation = ref('')
const filterInstallDate = ref('')
const sortBy = ref('name')

// Alerts for navigation and apiary cards
const alerts = ref([])
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

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// 🆕 ADD SUBSCRIPTION COMPOSABLE
const { subscription, loadSubscription, getCurrentUsage } = useSubscription()

// Use the centralized hive data composable
const {
  hivesWithSensorData,
  loading: hivesLoading,
  error: hivesError,
  loadAllData: loadHiveData
} = useHiveData()

// 🆕 SUBSCRIPTION COMPUTED PROPERTIES
const currentUsage = ref({
  apiaries: 0,
  hives: 0,
  hubs: 0
})

const canAddApiary = computed(() => {
  if (!subscription.value) return false
  const maxApiaries = subscription.value.limits.max_apiaries
  return maxApiaries === -1 || currentUsage.value.apiaries < maxApiaries
})

const apiaryUsagePercent = computed(() => {
  if (!subscription.value || subscription.value.limits.max_apiaries === -1) return 0
  return (currentUsage.value.apiaries / subscription.value.limits.max_apiaries) * 100
})

const isNearApiaryLimit = computed(() => apiaryUsagePercent.value >= 80 && apiaryUsagePercent.value < 100)
const isAtApiaryLimit = computed(() => apiaryUsagePercent.value >= 100)

const apiaryUpgradeMessage = computed(() => {
  if (!subscription.value) return 'Please upgrade to create more apiaries.'
  const plan = subscription.value.plan
  const limit = subscription.value.limits.max_apiaries
  
  if (plan === 'free') {
    return `You've reached the apiary limit for your Free plan (${limit} apiary). Upgrade to Basic ($9.95/month) to get 2 apiaries.`
  } else if (plan === 'basic') {
    return `You've reached the apiary limit for your Basic plan (${limit} apiaries). Upgrade to Pro ($19.95/month) to get 5 apiaries.`
  } else if (plan === 'pro') {
    return `You've reached the apiary limit for your Pro plan (${limit} apiaries). Contact sales for Enterprise with unlimited apiaries.`
  }
  return `You've reached your apiary limit (${limit}). Please upgrade your plan.`
})

// 🎨 SUBSCRIPTION STYLING (kept for modal usage)

// Enhanced computed for apiaries with full hive data
const apiariesWithFullHiveData = computed(() => {
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
    // Get hives for this apiary from the composable data
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

// Filter computed properties
const filteredApiaries = computed(() => {
  let filtered = apiariesWithFullHiveData.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(apiary => 
      (apiary.name && apiary.name.toLowerCase().includes(query)) ||
      (apiary.description && apiary.description.toLowerCase().includes(query)) ||
      (apiary.address && apiary.address.toLowerCase().includes(query))
    )
  }

  // Status filter
  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    filtered = filtered.filter(apiary => apiary.is_active === isActive)
  }

  // Hive count filter
  if (filterHiveCount.value) {
    filtered = filtered.filter(apiary => {
      const hiveCount = apiary.hive_count || 0
      switch (filterHiveCount.value) {
        case 'empty': return hiveCount === 0
        case 'small': return hiveCount >= 1 && hiveCount <= 3
        case 'medium': return hiveCount >= 4 && hiveCount <= 10
        case 'large': return hiveCount >= 11
        default: return true
      }
    })
  }

  // Alert filter
  if (filterAlerts.value) {
    filtered = filtered.filter(apiary => {
      const alerts = getApiaryAlerts(apiary.id)
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
      const warningAlerts = alerts.filter(alert => alert.severity === 'warning')
      
      switch (filterAlerts.value) {
        case 'none': return alerts.length === 0
        case 'warning': return warningAlerts.length > 0
        case 'critical': return criticalAlerts.length > 0
        default: return true
      }
    })
  }

  // Location filter
  if (filterLocation.value) {
    filtered = filtered.filter(apiary => {
      const hasLocation = apiary.address || (apiary.latitude && apiary.longitude)
      switch (filterLocation.value) {
        case 'with-location': return !!hasLocation
        case 'without-location': return !hasLocation
        default: return true
      }
    })
  }

  // Installation date filter
  if (filterInstallDate.value) {
    const now = new Date()
    filtered = filtered.filter(apiary => {
      if (!apiary.installation_date) return false
      const installDate = new Date(apiary.installation_date)
      
      switch (filterInstallDate.value) {
        case 'week':
          return (now - installDate) <= 7 * 24 * 60 * 60 * 1000
        case 'month':
          return (now - installDate) <= 30 * 24 * 60 * 60 * 1000
        case 'quarter':
          return (now - installDate) <= 90 * 24 * 60 * 60 * 1000
        case 'year':
          return (now - installDate) <= 365 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })
  }

  // Sort the results
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'created':
          return new Date(b.installation_date || b.created_at) - new Date(a.installation_date || a.created_at)
        case 'created-desc':
          return new Date(a.installation_date || a.created_at) - new Date(b.installation_date || b.created_at)
        case 'hive-count':
          return (b.hive_count || 0) - (a.hive_count || 0)
        case 'hive-count-desc':
          return (a.hive_count || 0) - (b.hive_count || 0)
        default:
          return 0
      }
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    filterStatus.value ||
    filterHiveCount.value ||
    filterAlerts.value ||
    filterLocation.value ||
    filterInstallDate.value
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterStatus.value) count++
  if (filterHiveCount.value) count++
  if (filterAlerts.value) count++
  if (filterLocation.value) count++
  if (filterInstallDate.value) count++
  return count
})

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Helper functions for collapsible cards
const toggleApiary = (apiaryId) => {
  expandedApiaries.value[apiaryId] = !expandedApiaries.value[apiaryId]
}

const getApiaryAlerts = (apiaryId) => {
  const apiaryHives = hivesWithSensorData.value.filter(hive => hive.apiary_id === apiaryId)
  return activeAlerts.value.filter(alert => 
    apiaryHives.some(hive => hive.id === alert.hive_id)
  )
}

// 🆕 SIMPLE ADD APIARY HANDLER (no restriction check - handled in modal)
const handleAddApiary = () => {
  showCreateModal.value = true
}

// Methods
const loadApiaries = async () => {
  if (!user.value) {
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch('/api/apiaries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    apiaries.value = response.data || []
    
  } catch (err) {
    console.error('Error loading apiaries:', err)
    error.value = err.message || 'Failed to load apiaries'
  } finally {
    loading.value = false
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
  }
}

// 🆕 UPDATE CURRENT USAGE
const updateCurrentUsage = async () => {
  try {
    const usage = await getCurrentUsage()
    currentUsage.value = {
      apiaries: usage.apiaries || 0,
      hives: usage.hives || 0,
      hubs: usage.hubs || 0
    }
  } catch (err) {
    console.error('Error updating current usage:', err)
  }
}

const viewApiaryDetails = (apiary) => {
  // Always use UUID for navigation - this should always be available
  if (!apiary.uuid) {
    console.error('Apiary missing UUID:', apiary)
    alert('Unable to view apiary details - missing identifier')
    return
  }
  navigateTo(`/apiaries/${apiary.uuid}`)
}

const viewHiveDetails = (hive) => {
  // Navigate to hive details page
  navigateTo(`/hives/${hive.id}`)
}

const handleApiaryCreated = async (newApiary) => {
  apiaries.value.push(newApiary)
  showCreateModal.value = false
  
  // Update usage after creating apiary
  await updateCurrentUsage()
}

// Filter helper functions
const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterHiveCount.value = ''
  filterAlerts.value = ''
  filterLocation.value = ''
  filterInstallDate.value = ''
  sortBy.value = 'name'
}

// Lifecycle
onMounted(async () => {
  // Load subscription, apiaries, hive data, and alerts
  await Promise.all([
    loadSubscription(),
    loadApiaries(),
    loadHiveData(),
    fetchAlerts()
  ])
  
  // Update current usage after loading data
  await updateCurrentUsage()
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await Promise.all([
      loadSubscription(),
      loadApiaries(),
      loadHiveData(),
      fetchAlerts()
    ])
    await updateCurrentUsage()
  } else {
    apiaries.value = []
    alerts.value = []
    currentUsage.value = { apiaries: 0, hives: 0, hubs: 0 }
  }
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}

.bg-gray-750 {
  background-color: #374151;
}
</style>