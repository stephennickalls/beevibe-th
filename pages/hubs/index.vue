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
            <h1 class="text-3xl font-bold mb-2">Apiary Hubs</h1>
            <p class="text-gray-400">Manage your ESP32 gateway devices and connectivity</p>
          </div>
          <button 
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            <span>Add Hub</span>
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
              {{ filteredHubs.length }} of {{ hubs.length }} hubs
            </div>
          </div>
          
          <div v-if="hasActiveFilters" class="flex items-center space-x-2">
            <span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
              {{ activeFilterCount }} filter{{ activeFilterCount > 1 ? 's' : '' }} active
            </span>
            <button 
              @click="clearAllFilters"
              class="text-xs text-gray-400 hover:text-white underline"
            >
              Clear all
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
              placeholder="Search hubs by name, UUID, or description..."
              class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filters -->
        <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Status</label>
            <select v-model="filterStatus" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="never-seen">Never Connected</option>
            </select>
          </div>

          <!-- Apiary Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Apiary</label>
            <select v-model="filterApiary" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Apiaries</option>
              <option value="unassigned">Unassigned</option>
              <option v-for="apiary in apiaries" :key="apiary.id" :value="apiary.id">
                {{ apiary.name }}
              </option>
            </select>
          </div>

          <!-- Firmware Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Firmware</label>
            <select v-model="filterFirmware" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Versions</option>
              <option value="outdated">Outdated</option>
              <option value="current">Current</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Sort by</label>
            <select v-model="sortBy" class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Default</option>
              <option value="name">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="last-seen">Last Seen (Recent)</option>
              <option value="last-seen-desc">Last Seen (Oldest)</option>
              <option value="created">Newest First</option>
              <option value="created-desc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="hubs.length === 0" class="text-center py-12">
        <!-- Updated Hub Icon for Empty State -->
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 694 825" xmlns="http://www.w3.org/2000/svg">
          <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
          <path d="M493.885 327.195V496.804L347 581.607L200.115 496.804V327.195L347 242.392L493.885 327.195Z" stroke="currentColor" stroke-width="18" fill="none"/>
          <path d="M381.568 671.782L415.75 730.987L381.568 790.191L313.204 790.191L279.023 730.987L313.204 671.782L381.568 671.782Z"/>
          <path d="M359.281 586.24C359.69 579.902 354.884 574.433 348.546 574.024C342.207 573.615 336.738 578.422 336.329 584.76L347.805 585.5L359.281 586.24ZM336.306 725.592L336.398 737.092L359.397 736.907L359.305 725.408L347.805 725.5L336.306 725.592ZM347.805 585.5L336.329 584.76C335.494 597.707 335.975 684.473 336.306 725.592L347.805 725.5L359.305 725.408C358.968 683.527 358.517 598.093 359.281 586.24L347.805 585.5Z"/>
          <path d="M382.568 152.591L416.75 93.3862L382.568 34.1817L314.204 34.1817L280.023 93.3862L314.204 152.591L382.568 152.591Z"/>
          <path d="M360.281 238.133C360.69 244.471 355.884 249.94 349.546 250.349C343.207 250.758 337.738 245.952 337.329 239.613L348.805 238.873L360.281 238.133ZM337.306 98.7807L337.398 87.2811L360.397 87.4658L360.305 98.9654L348.805 98.873L337.306 98.7807ZM348.805 238.873L337.329 239.613C336.494 226.666 336.975 139.9 337.306 98.7807L348.805 98.873L360.305 98.9654C359.968 140.846 359.517 226.28 360.281 238.133L348.805 238.873Z"/>
          <path d="M556.325 250.568L590.507 191.363L658.87 191.363L693.052 250.568L658.87 309.772L590.507 309.772L556.325 250.568Z"/>
          <path d="M493.387 312.64C487.693 315.455 485.36 322.352 488.175 328.045C490.99 333.739 497.887 336.072 503.58 333.257L498.484 322.949L493.387 312.64ZM625.557 262.861L635.47 257.031L623.81 237.206L613.897 243.036L619.727 252.949L625.557 262.861ZM498.484 322.949L503.58 333.257C515.211 327.507 590.111 283.707 625.557 262.861L619.727 252.949L613.897 243.036C577.796 264.267 504.034 307.375 493.387 312.64L498.484 322.949Z"/>
          <path d="M140.932 254.569L106.75 195.364L38.3863 195.364L4.20456 254.569L38.3863 313.773L106.75 313.773L140.932 254.569Z"/>
          <path d="M203.87 316.64C209.563 319.455 211.897 326.353 209.082 332.046C206.267 337.74 199.369 340.073 193.676 337.258L198.773 326.949L203.87 316.64ZM71.6995 266.862L61.7867 261.032L73.4463 241.207L83.3591 247.036L77.5293 256.949L71.6995 266.862ZM198.773 326.949L193.676 337.258C182.046 331.508 107.145 287.708 71.6995 266.862L77.5293 256.949L83.3591 247.036C119.46 268.268 193.222 311.376 203.87 316.64L198.773 326.949Z"/>
          <path d="M556.325 572.618L590.507 631.823L658.87 631.823L693.052 572.618L658.87 513.414L590.507 513.414L556.325 572.618Z"/>
          <path d="M493.387 510.547C487.693 507.732 485.36 500.834 488.175 495.141C490.99 489.447 497.887 487.114 503.58 489.929L498.484 500.238L493.387 510.547ZM625.557 560.325L635.47 566.155L623.81 585.98L613.897 580.151L619.727 570.238L625.557 560.325ZM498.484 500.238L503.58 489.929C515.211 495.679 590.111 539.479 625.557 560.325L619.727 570.238L613.897 580.151C577.796 558.919 504.034 515.811 493.387 510.547L498.484 500.238Z"/>
          <path d="M136.931 573.618L102.75 632.823L34.3862 632.823L0.204471 573.618L34.3862 514.414L102.75 514.414L136.931 573.618Z"/>
          <path d="M199.87 511.547C205.563 508.732 207.896 501.834 205.082 496.141C202.267 490.447 195.369 488.114 189.676 490.929L194.773 501.238L199.87 511.547ZM67.6993 561.325L57.7866 567.155L69.4462 586.98L79.359 581.151L73.5292 571.238L67.6993 561.325ZM194.773 501.238L189.676 490.929C178.046 496.679 103.145 540.479 67.6993 561.325L73.5292 571.238L79.359 581.151C115.46 559.919 189.222 516.811 199.87 511.547L194.773 501.238Z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-300 mb-2">No hubs found</h3>
        <p class="text-gray-400 mb-4">Get started by adding your first apiary hub.</p>
        <button 
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Add Your First Hub
        </button>
      </div>

      <!-- Hub Cards List -->
      <div v-else class="space-y-4">
        <ApiaryHubCard
          v-for="hub in filteredHubs"
          :key="hub.id"
          :hub="hub"
          @click="navigateToHubDetails"
        />
      </div>

      <!-- No Results -->
      <div v-if="!loading && hubs.length > 0 && filteredHubs.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-300 mb-2">No hubs match your filters</h3>
        <p class="text-gray-400 mb-4">Try adjusting your search criteria or filters.</p>
        <button 
          @click="clearAllFilters"
          class="text-blue-400 hover:text-blue-300 underline"
        >
          Clear all filters
        </button>
      </div>
    </div>

    <!-- Add Hub Modal Component -->
    <AddHubModal
      :visible="showCreateModal"
      :apiaries="apiaries"
      @close="showCreateModal = false"
      @success="handleHubCreated"
      @error="handleHubCreateError"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser, navigateTo } from '#imports'
import ApiaryHubCard from '~/components/apiary/ApiaryHubCard.vue'
import AddHubModal from '~/components/hub/AddHubModal.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Helper function to get auth token (matching working pages pattern)
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Loading states
const loading = ref(true)

// Data
const hubs = ref([])
const apiaries = ref([])
const activeAlerts = ref([])

// UI state
const showFilters = ref(false)

// Modal states
const showCreateModal = ref(false)

// Filter state
const searchQuery = ref('')
const filterStatus = ref('')
const filterApiary = ref('')
const filterFirmware = ref('')
const sortBy = ref('')

// Computed properties
const filteredHubs = computed(() => {
  let filtered = [...hubs.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(hub => 
      hub.name.toLowerCase().includes(query) ||
      hub.description?.toLowerCase().includes(query) ||
      hub.uuid?.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (filterStatus.value) {
    switch (filterStatus.value) {
      case 'online':
        filtered = filtered.filter(hub => isHubOnline(hub))
        break
      case 'offline':
        filtered = filtered.filter(hub => !isHubOnline(hub) && hub.last_seen)
        break
      case 'never-seen':
        filtered = filtered.filter(hub => !hub.last_seen)
        break
    }
  }

  // Apiary filter
  if (filterApiary.value) {
    if (filterApiary.value === 'unassigned') {
      filtered = filtered.filter(hub => !hub.apiary_id)
    } else {
      filtered = filtered.filter(hub => hub.apiary_id === parseInt(filterApiary.value))
    }
  }

  // Firmware filter
  if (filterFirmware.value) {
    switch (filterFirmware.value) {
      case 'outdated':
        filtered = filtered.filter(hub => hub.firmware_version && hub.firmware_version < '2.0.0')
        break
      case 'current':
        filtered = filtered.filter(hub => hub.firmware_version && hub.firmware_version >= '2.0.0')
        break
      case 'unknown':
        filtered = filtered.filter(hub => !hub.firmware_version)
        break
    }
  }

  // Sort
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'last-seen':
          return new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime()
        case 'last-seen-desc':
          return new Date(a.last_seen || 0).getTime() - new Date(b.last_seen || 0).getTime()
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'created-desc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
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
    filterApiary.value ||
    filterFirmware.value
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (searchQuery.value) count++
  if (filterStatus.value) count++
  if (filterApiary.value) count++
  if (filterFirmware.value) count++
  return count
})

// Helper functions
const isHubOnline = (hub) => {
  if (!hub.last_seen) return false
  const lastSeen = new Date(hub.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000 // 5 minutes
}

// UI actions
const clearAllFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterApiary.value = ''
  filterFirmware.value = ''
  sortBy.value = ''
}

// Event handlers
const navigateToHubDetails = (hub) => {
  // Use UUID if available, otherwise fall back to numeric ID
  const hubIdentifier = hub.uuid || hub.id
  navigateTo(`/hubs/${hubIdentifier}`)
}

const handleHubCreated = (newHub) => {
  console.log('Hub created successfully:', newHub)
  // Refresh the data to show the new hub
  loadData()
}

const handleHubCreateError = (error) => {
  console.error('Failed to create hub:', error)
  // Could show a toast notification here
}

// API actions
const loadData = async () => {
  loading.value = true
  
  try {
    // Get auth token for API calls (matching working pages pattern)
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    // Load hubs via API endpoint with authorization header
    const hubsResponse = await $fetch('/api/hubs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (hubsResponse.error) {
      throw new Error(hubsResponse.error)
    }

    if (!hubsResponse.success) {
      throw new Error(hubsResponse.message || 'Failed to load hubs')
    }

    hubs.value = hubsResponse.data || []

    // Load apiaries for dropdowns (keep direct call since it's simple)
    const { data: apiaryData, error: apiaryError } = await supabase
      .from('apiaries')
      .select('id, name')
      .order('name')
    
    if (apiaryError) throw apiaryError
    apiaries.value = apiaryData || []

  } catch (error) {
    console.error('Error loading data:', error)
    // Could show a toast notification here
  } finally {
    loading.value = false
  }
}

// Page metadata
definePageMeta({
  title: 'Apiary Hubs - BeeVibe Dashboard',
  middleware: ['auth']
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>