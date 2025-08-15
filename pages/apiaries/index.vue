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
            <h1 class="text-3xl font-bold mb-2">Apiaries & Hubs</h1>
            <p class="text-gray-400">Manage your bee yards and their gateway devices</p>
          </div>
          <div class="flex gap-3">
            <button 
              @click="navigateToAllHubs"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 694 825" xmlns="http://www.w3.org/2000/svg">
                <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z"/>
                <path d="M493.885 327.195V496.804L347 581.607L200.115 496.804V327.195L347 242.392L493.885 327.195Z" stroke="currentColor" stroke-width="18" fill="none"/>
              </svg>
              <span>View All Hubs</span>
            </button>
            <button 
              @click="showCreateApiaryModal = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
              </svg>
              <span>Add Apiary</span>
            </button>
          </div>
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
            </button>
            
            <div class="text-sm text-gray-400">
              {{ apiaries.length }} {{ apiaries.length === 1 ? 'apiary' : 'apiaries' }}, {{ totalHubs }} {{ totalHubs === 1 ? 'hub' : 'hubs' }}
            </div>
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
              placeholder="Search apiaries and hubs..."
              class="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filters -->
        <div v-show="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Hub Status</label>
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
              <option value="created">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Apiaries with their Hubs -->
      <div v-else class="space-y-6">
        <!-- Apiaries with their Hubs -->
        <div v-for="apiary in filteredApiaries" :key="apiary.id" class="bg-gray-900 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
              <div>
                <button 
                  @click="navigateToApiaryDetails(apiary)"
                  class="text-lg font-semibold hover:text-blue-400 transition-colors text-left"
                >
                  {{ apiary.name }}
                </button>
                <p class="text-sm text-gray-400">
                  {{ apiary.description || 'No description' }} • 
                  {{ apiary.hubs?.length || 0 }} hub{{ (apiary.hubs?.length || 0) !== 1 ? 's' : '' }}, 
                  {{ apiary.hive_count || 0 }} hive{{ (apiary.hive_count || 0) !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                v-if="!apiary.hubs || apiary.hubs.length === 0"
                @click="showCreateHubModal = true; selectedApiaryId = apiary.id"
                class="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-lg text-sm transition-colors"
              >
                Assign Hub
              </button>
              <button 
                @click="navigateToApiaryDetails(apiary)"
                class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
          
          <!-- Hubs in this Apiary -->
          <div v-if="apiary.hubs && apiary.hubs.length > 0" class="space-y-4">
            <ApiaryHubCard
              v-for="hub in apiary.hubs" 
              :key="hub.id"
              :hub="hub"
              @click="navigateToHubDetails"
            />
          </div>
          
          <!-- No Hubs in Apiary -->
          <div v-else class="text-center py-8 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-500" viewBox="0 0 694 825" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z" opacity="0.5"/>
            </svg>
            <p class="text-gray-400 mb-3">No hubs assigned to this apiary</p>
            <button 
              @click="showCreateHubModal = true; selectedApiaryId = apiary.id"
              class="text-blue-400 hover:text-blue-300 text-sm"
            >
              Assign the first hub
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="apiaries.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          <h3 class="text-xl font-semibold mb-2">No Apiaries Yet</h3>
          <p class="text-gray-400 mb-6">Create your first apiary to start managing your bee yards and hubs.</p>
          <button 
            @click="showCreateApiaryModal = true"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Create Your First Apiary
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
import ApiaryHubCard from '~/components/ApiaryHubCard.vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const apiaries = ref([])
const allHubs = ref([])
const activeAlerts = ref([])

// UI State
const showFilters = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterApiary = ref('')
const filterFirmware = ref('')
const sortBy = ref('')

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
const totalHubs = computed(() => allHubs.value.length)

const filteredApiaries = computed(() => {
  if (!searchQuery.value) return apiaries.value
  
  const query = searchQuery.value.toLowerCase()
  return apiaries.value.filter(apiary => {
    const nameMatch = apiary.name.toLowerCase().includes(query)
    const descMatch = apiary.description?.toLowerCase().includes(query)
    const hubMatch = apiary.hubs?.some(hub => 
      hub.name.toLowerCase().includes(query) ||
      hub.description?.toLowerCase().includes(query)
    )
    return nameMatch || descMatch || hubMatch
  })
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

const navigateToHubDetails = (hub) => {
  const identifier = hub.uuid || hub.id
  navigateTo(`/hubs/${identifier}`)
}

const navigateToAllHubs = () => {
  navigateTo('/hubs')
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

// Data loading
const loadData = async () => {
  loading.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication token not available')

    // Load apiaries
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
        created_at,
        hive_count:hives(count)
      `)
      .eq('user_id', user.value.id)
      .order('name')
    
    if (apiaryError) throw apiaryError

    // Load hubs
    const hubsResponse = await $fetch('/api/hubs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!hubsResponse.success) throw new Error(hubsResponse.message)

    // Group hubs by apiary
    const hubsByApiary = {}
    hubsResponse.data.forEach(hub => {
      const apiaryId = hub.apiary_id
      if (apiaryId) {
        if (!hubsByApiary[apiaryId]) hubsByApiary[apiaryId] = []
        hubsByApiary[apiaryId].push(hub)
      }
    })

    // Attach hubs to apiaries
    apiaries.value = (apiaryData || []).map(apiary => ({
      ...apiary,
      hive_count: apiary.hive_count?.[0]?.count || 0,
      hubs: hubsByApiary[apiary.id] || []
    }))

    allHubs.value = hubsResponse.data || []

  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// Page metadata
definePageMeta({
  title: 'Apiaries & Hubs - BeeVibe Dashboard',
  middleware: ['auth']
})

// Lifecycle
onMounted(() => {
  loadData()
})
</script>