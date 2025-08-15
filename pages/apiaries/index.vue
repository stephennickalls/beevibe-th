<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Header -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold mb-2">My Apiaries</h1>
            <p class="text-gray-400">Manage your bee yards and monitor hive health</p>
          </div>
          
          <button 
            @click="showCreateApiaryModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>New Apiary</span>
          </button>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="bg-gray-900 rounded-xl p-4 mb-6">
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
            </button>
            
            <div class="text-sm text-gray-400">
              {{ filteredApiaries.length }} of {{ apiaries.length }} apiaries
            </div>
          </div>
          
          <!-- View Options -->
          <div class="flex items-center gap-2">
            <button 
              @click="viewMode = 'cards'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                viewMode === 'cards' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button 
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1.5 text-sm rounded transition-colors',
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search apiaries by name, location, or description..."
              class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filters -->
        <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Status</label>
            <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="needs-attention">Needs Attention</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Hive Count</label>
            <select v-model="filterHiveCount" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Any Count</option>
              <option value="0">No Hives</option>
              <option value="1-5">1-5 Hives</option>
              <option value="6-10">6-10 Hives</option>
              <option value="11+">11+ Hives</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Hub Status</label>
            <select v-model="filterHubStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Hubs</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="no-hub">No Hub</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Sort by</label>
            <select v-model="sortBy" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="name">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="hive-count">Most Hives</option>
              <option value="recent">Recently Updated</option>
              <option value="alerts">Most Alerts</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Enhanced Apiary Cards/List -->
      <div v-else>
        <!-- Card View -->
        <div v-if="viewMode === 'cards'" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <EnhancedApiaryCard
            v-for="apiary in filteredApiaries"
            :key="apiary.id"
            :apiary="apiary"
            @click="navigateToApiaryDetails"
            @quick-action="handleQuickAction"
          />
        </div>

        <!-- List View -->
        <div v-else class="space-y-4">
          <EnhancedApiaryListItem
            v-for="apiary in filteredApiaries"
            :key="apiary.id"
            :apiary="apiary"
            @click="navigateToApiaryDetails"
            @quick-action="handleQuickAction"
          />
        </div>

        <!-- Empty State -->
        <div v-if="apiaries.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          <h3 class="text-xl font-semibold mb-2">Start Your Beekeeping Journey</h3>
          <p class="text-gray-400 mb-6">Create your first apiary to begin monitoring your hives and managing your bee colonies.</p>
          <button 
            @click="showCreateApiaryModal = true"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Create Your First Apiary
          </button>
        </div>

        <!-- No Results State -->
        <div v-else-if="filteredApiaries.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
          </svg>
          <h3 class="text-xl font-semibold mb-2">No Apiaries Found</h3>
          <p class="text-gray-400 mb-6">Try adjusting your search criteria or filters.</p>
          <button 
            @click="clearFilters"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Create Apiary Modal -->
    <CreateApiaryModal
      :visible="showCreateApiaryModal"
      @close="showCreateApiaryModal = false"
      @success="handleApiaryCreated"
    />

    <!-- Create Hub Modal -->
    <CreateHubModal
      :visible="showCreateHubModal"
      :apiaries="apiaries"
      :selected-apiary-id="selectedApiaryId"
      @close="showCreateHubModal = false; selectedApiaryId = null"
      @success="handleHubCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import EnhancedApiaryCard from '~/components/apiary/EnhancedApiaryCard.vue'
import EnhancedApiaryListItem from '~/components/apiary/EnhancedApiaryListItem.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const apiaries = ref([])
const allHubs = ref([])
const activeAlerts = ref([])

// UI State
const viewMode = ref('cards') // 'cards' or 'list'
const showFilters = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterHiveCount = ref('')
const filterHubStatus = ref('')
const sortBy = ref('name')

// Modal state
const showCreateApiaryModal = ref(false)
const showCreateHubModal = ref(false)
const selectedApiaryId = ref(null)

// Helper function
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Computed properties
const totalHives = computed(() => {
  return apiaries.value.reduce((total, apiary) => total + (apiary.hive_count || 0), 0)
})

const totalActiveHubs = computed(() => {
  return allHubs.value.filter(hub => isHubOnline(hub)).length
})

const filteredApiaries = computed(() => {
  let filtered = [...apiaries.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(apiary => 
      apiary.name.toLowerCase().includes(query) ||
      apiary.description?.toLowerCase().includes(query) ||
      apiary.address?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(apiary => {
      switch (filterStatus.value) {
        case 'active':
          return apiary.is_active
        case 'inactive':
          return !apiary.is_active
        case 'needs-attention':
          return apiary.alert_count > 0
        default:
          return true
      }
    })
  }

  // Hive count filter
  if (filterHiveCount.value) {
    filtered = filtered.filter(apiary => {
      const count = apiary.hive_count || 0
      switch (filterHiveCount.value) {
        case '0':
          return count === 0
        case '1-5':
          return count >= 1 && count <= 5
        case '6-10':
          return count >= 6 && count <= 10
        case '11+':
          return count >= 11
        default:
          return true
      }
    })
  }

  // Hub status filter
  if (filterHubStatus.value) {
    filtered = filtered.filter(apiary => {
      const hasHub = apiary.hubs && apiary.hubs.length > 0
      const hasOnlineHub = hasHub && apiary.hubs.some(hub => isHubOnline(hub))
      
      switch (filterHubStatus.value) {
        case 'connected':
          return hasOnlineHub
        case 'disconnected':
          return hasHub && !hasOnlineHub
        case 'no-hub':
          return !hasHub
        default:
          return true
      }
    })
  }

  // Sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'hive-count':
          return (b.hive_count || 0) - (a.hive_count || 0)
        case 'recent':
          return new Date(b.updated_at) - new Date(a.updated_at)
        case 'alerts':
          return (b.alert_count || 0) - (a.alert_count || 0)
        default:
          return 0
      }
    })
  }

  return filtered
})

// Helper functions
const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000
}

// Navigation functions
const navigateToApiaryDetails = (apiary) => {
  const identifier = apiary.uuid || apiary.id
  navigateTo(`/apiaries/${identifier}`)
}

// Event handlers
const handleApiaryCreated = () => {
  loadData()
  showCreateApiaryModal.value = false
}

const handleHubCreated = () => {
  loadData()
  showCreateHubModal.value = false
  selectedApiaryId.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterHiveCount.value = ''
  filterHubStatus.value = ''
  sortBy.value = 'name'
}

const handleQuickAction = ({ action, apiary }) => {
  switch (action) {
    case 'manage':
      navigateToApiaryDetails(apiary)
      break
    case 'view-alerts':
      // Navigate to alerts page filtered by apiary
      navigateTo(`/alerts?apiary=${apiary.id}`)
      break
    case 'add-hub':
      // Show add hub modal with apiary preselected
      showCreateHubModal.value = true
      selectedApiaryId.value = apiary.id
      break
  }
}

// Data loading
const loadData = async () => {
  loading.value = true
  
  try {
    console.log('🚀 Loading apiaries data...')
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    console.log('✅ Auth token obtained')

    // Load apiaries with enhanced data
    const { data: apiaryData, error: apiaryError } = await supabase
      .from('apiaries')
      .select(`
        id,
        uuid,
        name,
        description,
        latitude,
        longitude,
        address,
        is_active,
        installation_date,
        created_at,
        updated_at,
        hive_count:hives(count)
      `)
      .eq('user_id', user.value.id)
      .order('name')
    
    console.log('📊 Apiaries query result:', { apiaryData, apiaryError, userID: user.value.id })
    
    if (apiaryError) {
      console.error('❌ Apiaries query error:', apiaryError)
      throw apiaryError
    }

    // Load hubs for connectivity status
    console.log('🔌 Loading hubs data...')
    const hubsResponse = await $fetch('/api/hubs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    console.log('🔌 Hubs response:', hubsResponse)
    
    if (!hubsResponse.success) {
      console.error('❌ Hubs API error:', hubsResponse.message)
      throw new Error(hubsResponse.message)
    }

    // Group hubs by apiary
    const hubsByApiary = {}
    hubsResponse.data.forEach(hub => {
      const apiaryId = hub.apiary_id
      if (apiaryId) {
        if (!hubsByApiary[apiaryId]) hubsByApiary[apiaryId] = []
        hubsByApiary[apiaryId].push(hub)
      }
    })

    console.log('🔗 Hubs grouped by apiary:', hubsByApiary)

    // Load alerts (mock for now)
    // TODO: Replace with real alerts API
    const alertsByApiary = {}

    // Enhance apiaries with additional data
    apiaries.value = (apiaryData || []).map(apiary => ({
      ...apiary,
      hive_count: apiary.hive_count?.[0]?.count || 0,
      hubs: hubsByApiary[apiary.id] || [],
      alert_count: alertsByApiary[apiary.id]?.length || 0,
      health_score: calculateHealthScore(apiary, hubsByApiary[apiary.id] || [])
    }))

    allHubs.value = hubsResponse.data || []

    console.log('✅ Final apiaries data:', apiaries.value)
    console.log('✅ Total apiaries loaded:', apiaries.value.length)

  } catch (error) {
    console.error('❌ Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// Calculate health score for an apiary
const calculateHealthScore = (apiary, hubs) => {
  let score = 100
  
  // Deduct points for inactive status
  if (!apiary.is_active) score -= 50
  
  // Deduct points for no hubs
  if (!hubs || hubs.length === 0) score -= 20
  
  // Deduct points for offline hubs
  if (hubs.length > 0) {
    const offlineHubs = hubs.filter(hub => !isHubOnline(hub))
    score -= (offlineHubs.length / hubs.length) * 30
  }
  
  return Math.max(0, score)
}

// Page metadata
definePageMeta({
  title: 'My Apiaries - BeeVibe Dashboard',
  middleware: ['auth']
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>