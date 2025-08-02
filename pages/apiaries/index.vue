<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation Component -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation Component -->
      <MobileNavigation />

      <!-- Header -->
      <div class="mb-8">
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Apiaries</p>
              <p class="text-2xl font-bold">{{ apiaries.length }}</p>
            </div>
            <div class="p-3 bg-blue-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Total Hives</p>
              <p class="text-2xl font-bold">{{ totalHives }}</p>
            </div>
            <div class="p-3 bg-green-600 rounded-full">
              <svg class="w-4 h-4" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M51 31C53.2091 31 55 32.7909 55 35V52C55 54.2091 53.2091 56 51 56H4C1.79086 56 0 54.2091 0 52V35C3.54346e-07 32.7909 1.79086 31 4 31H51ZM19.5 36C18.6716 36 18 36.6716 18 37.5C18 38.3284 18.6716 39 19.5 39H37.5C38.3284 39 39 38.3284 39 37.5C39 36.6716 38.3284 36 37.5 36H19.5Z" fill="currentColor"/>
                <path d="M51 13C53.2091 13 55 14.7909 55 17V24C55 26.2091 53.2091 28 51 28H4C1.79086 28 1.12747e-07 26.2091 0 24V17C0 14.7909 1.79086 13 4 13H51ZM18.5 17C17.6716 17 17 17.6716 17 18.5C17 19.3284 17.6716 20 18.5 20H36.5C37.3284 20 38 19.3284 38 18.5C38 17.6716 37.3284 17 36.5 17H18.5Z" fill="currentColor"/>
                <path d="M51 0C53.2091 0 55 1.79086 55 4V6C55 8.20914 53.2091 10 51 10H4C1.79086 10 3.22133e-08 8.20914 0 6V4C0 1.79086 1.79086 0 4 0H51ZM18.5 3C17.6716 3 17 3.67157 17 4.5C17 5.32843 17.6716 6 18.5 6H36.5C37.3284 6 38 5.32843 38 4.5C38 3.67157 37.3284 3 36.5 3H18.5Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm">Active Apiaries</p>
              <p class="text-2xl font-bold">{{ activeApiaries }}</p>
            </div>
            <div class="p-3 bg-yellow-600 rounded-full">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            </div>
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

      <!-- Empty State -->
      <div v-else-if="apiaries.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <h3 class="text-xl font-semibold mb-2">No Apiaries Yet</h3>
        <p class="text-gray-400 mb-6">Create your first apiary to start organizing your hives by location</p>
        <button 
          @click="showCreateModal = true"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Create Your First Apiary
        </button>
      </div>

      <!-- Apiaries Grid - Updated for flexible sizing -->
      <div v-else class="space-y-6">
        <ApiaryCard
          v-for="apiary in apiariesWithFullHiveData"
          :key="apiary.id"
          :apiary="apiary"
          @click="viewApiaryDetails"
          @hive-click="viewHiveDetails"
        />
      </div>
    </div>

    <!-- Create Apiary Modal -->
    <CreateApiaryModal 
      :show="showCreateModal"
      @close="showCreateModal = false"
      @created="handleApiaryCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ApiaryCard from '~/components/ApiaryCard.vue'

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

// Mock alerts data for navigation
const activeAlerts = ref([])

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Use the centralized hive data composable
const {
  hivesWithSensorData,
  loading: hivesLoading,
  error: hivesError,
  loadAllData: loadHiveData
} = useHiveData()

// Computed
const totalHives = computed(() => {
  return apiaries.value.reduce((total, apiary) => total + (apiary.hive_count || 0), 0)
})

const activeApiaries = computed(() => {
  return apiaries.value.filter(a => a.is_active).length
})

// Enhanced computed for apiaries with full hive data
const apiariesWithFullHiveData = computed(() => {
  if (!apiaries.value.length || !hivesWithSensorData.value.length) {
    return apiaries.value
  }

  return apiaries.value.map(apiary => {
    // Get hives for this apiary from the composable data
    const apiaryHives = hivesWithSensorData.value.filter(hive => hive.apiary_id === apiary.id)
    
    return {
      ...apiary,
      hives: apiaryHives,
      hive_count: apiaryHives.length
    }
  })
})

// Methods
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

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

const viewApiaryDetails = (apiary) => {
  // Navigate to apiary details page
  navigateTo(`/apiaries/${apiary.id}`)
}

const viewHiveDetails = (hive, apiary) => {
  // Navigate to hive details page
  navigateTo(`/hives/${hive.id}`)
}

const handleApiaryCreated = (newApiary) => {
  apiaries.value.push(newApiary)
  showCreateModal.value = false
}

// Lifecycle
onMounted(async () => {
  // Load both apiaries and hive data
  await Promise.all([
    loadApiaries(),
    loadHiveData()
  ])
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await Promise.all([
      loadApiaries(),
      loadHiveData()
    ])
  } else {
    apiaries.value = []
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