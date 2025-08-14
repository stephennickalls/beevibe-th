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
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
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

    <!-- Create Hub Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-white">Add New Hub</h3>
            <button @click="showCreateModal = false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="createHub">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Hub Name</label>
                <input
                  v-model="createForm.name"
                  type="text"
                  required
                  placeholder="Enter hub name..."
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  v-model="createForm.description"
                  rows="3"
                  placeholder="Enter description (optional)..."
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Assign to Apiary</label>
                <select
                  v-model="createForm.apiary_id"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option :value="null">Leave unassigned</option>
                  <option v-for="apiary in apiaries" :key="apiary.id" :value="apiary.id">
                    {{ apiary.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!createForm.name || createLoading"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {{ createLoading ? 'Creating...' : 'Create Hub' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser, navigateTo } from '#imports'
import ApiaryHubCard from '~/components/ApiaryHubCard.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Loading states
const loading = ref(true)
const createLoading = ref(false)

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

// Form data
const createForm = ref({
  name: '',
  description: '',
  apiary_id: null
})

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
  navigateTo(`/hubs/${hub.id}`)
}

// API actions
const loadData = async () => {
  loading.value = true
  
  try {
    // Load hubs with apiary info and sensor units count
    const { data: hubData, error: hubError } = await supabase
      .from('apiary_hubs')
      .select(`
        *,
        apiary:apiaries(id, name),
        sensor_units_count:sensor_units(count)
      `)
      .order('last_seen', { ascending: false, nullsFirst: false })
    
    if (hubError) throw hubError

    // Load telemetry data
    const hubIds = (hubData || []).map(h => h.id)
    let telemetryData = []
    
    if (hubIds.length > 0) {
      const { data: tData, error: tError } = await supabase
        .from('device_telemetry')
        .select('*')
        .in('device_id', hubIds)
        .eq('device_type', 'HUB')
        .order('recorded_at', { ascending: false })
      
      if (!tError) telemetryData = tData || []
    }

    // Load pending commands count
    let pendingCommandsData = []
    if (hubIds.length > 0) {
      const { data: cmdData, error: cmdError } = await supabase
        .from('device_commands')
        .select('device_id')
        .in('device_id', hubIds)
        .eq('device_type', 'HUB')
        .in('status', ['queued', 'sent'])
      
      if (!cmdError) pendingCommandsData = cmdData || []
    }

    // Combine hub data with latest telemetry and pending commands
    const telemetryByHub = {}
    telemetryData.forEach(t => {
      if (!telemetryByHub[t.device_id]) {
        telemetryByHub[t.device_id] = t
      }
    })

    const pendingCommandsByHub = {}
    pendingCommandsData.forEach(cmd => {
      pendingCommandsByHub[cmd.device_id] = (pendingCommandsByHub[cmd.device_id] || 0) + 1
    })

    hubs.value = (hubData || []).map(hub => ({
      ...hub,
      sensor_units_count: hub.sensor_units_count?.[0]?.count || 0,
      telemetry: telemetryByHub[hub.id] || null,
      pending_commands_count: pendingCommandsByHub[hub.id] || 0
    }))

    // Load apiaries for dropdowns
    const { data: apiaryData, error: apiaryError } = await supabase
      .from('apiaries')
      .select('id, name')
      .order('name')
    
    if (apiaryError) throw apiaryError
    apiaries.value = apiaryData || []

  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

const createHub = async () => {
  createLoading.value = true
  
  try {
    const { error } = await supabase
      .from('apiary_hubs')
      .insert({
        name: createForm.value.name,
        description: createForm.value.description || null,
        apiary_id: createForm.value.apiary_id || null
      })
    
    if (error) throw error
    
    showCreateModal.value = false
    createForm.value = { name: '', description: '', apiary_id: null }
    await loadData()
    
  } catch (error) {
    console.error('Error creating hub:', error)
  } finally {
    createLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>