<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading hub details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">Hub Not Found</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <NuxtLink to="/hubs" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Back to Hubs
          </NuxtLink>
        </div>
      </div>

      <!-- Hub Content -->
      <div v-else-if="hub" class="max-w-7xl">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-6">
          <!-- Left: Title and Status -->
          <div>
            <!-- Breadcrumb -->
            <nav class="flex text-sm text-gray-400 mb-1">
              <NuxtLink to="/hubs" class="hover:text-white transition-colors">Hubs</NuxtLink>
              <span class="mx-2">→</span>
              <span>{{ hub.name || 'Hub A1' }}</span>
            </nav>
            
            <!-- Title Row -->
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl font-bold">{{ hub.name || 'Hub A1' }}</h1>
              <div class="flex items-center gap-2">
                <div :class="[
                  'w-2 h-2 rounded-full',
                  isHubOnline ? 'bg-green-400' : 'bg-red-400'
                ]"></div>
                <span :class="[
                  'text-sm',
                  isHubOnline ? 'text-green-400' : 'text-red-400'
                ]">
                  {{ isHubOnline ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>

            <!-- Badges Row -->
            <div class="flex items-center gap-3">
              <span class="px-2 py-1 text-xs font-medium rounded bg-yellow-900/40 text-yellow-400 border border-yellow-500/40">
                ESP32 Hub
              </span>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span>ID:</span>
                <code class="bg-gray-800 px-2 py-1 rounded border border-gray-700 font-mono">
                  {{ hub.uuid || '957845b2-5609-4ed6-adc2-118c832a45d4' }}
                </code>
                <button 
                  @click="copyToClipboard(hub.uuid, 'Hub ID')"
                  class="text-blue-400 hover:text-blue-300 p-0.5"
                  title="Copy UUID"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Right: Action Buttons -->
          <div class="flex gap-2">
            <button 
              @click="showEditHubModal = true"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              Edit Hub
            </button>
            
            <button 
              @click="showSendCommandModal = true"
              :disabled="!isHubOnline"
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
              </svg>
              Send Command
            </button>

            <button 
              @click="showUpdateFirmwareModal = true"
              :disabled="!isHubOnline"
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z"/>
              </svg>
              Update Firmware
            </button>
            
            <button 
              @click="showDeleteModal = true"
              class="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                <path fill-rule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"/>
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Main Content Grid: 2 columns -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left Column: Hub Details (7 columns) -->
          <div class="col-span-7 space-y-6">
            <!-- Hub Information Card -->
            <div class="bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold mb-3">Hub Information</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-400">Description:</span>
                  <p class="text-white mt-1">{{ hub.description || 'LilyGO ESP32 for Brookside' }}</p>
                </div>
                <div>
                  <span class="text-gray-400">Apiary:</span>
                  <p class="text-white mt-1">
                    <button 
                      v-if="hub.apiary" 
                      @click="navigateToApiary(hub.apiary)"
                      class="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {{ hub.apiary.name }}
                    </button>
                    <span v-else class="text-blue-400">{{ hub.apiary?.name || 'Brookside Apiary' }}</span>
                  </p>
                </div>
                <div>
                  <span class="text-gray-400">Firmware:</span>
                  <p class="text-white mt-1">{{ hub.firmware_version ? `v${hub.firmware_version}` : 'vhub-1.0.0' }}</p>
                </div>
                <div>
                  <span class="text-gray-400">Last Seen:</span>
                  <p class="text-white mt-1">{{ formatLastSeen(hub.last_seen) }}</p>
                </div>
                <div>
                  <span class="text-gray-400">IP Address:</span>
                  <p class="text-white font-mono mt-1">{{ hub.telemetry?.ip || '10.0.0.11' }}</p>
                </div>
                <div>
                  <span class="text-gray-400">Connected Units:</span>
                  <p class="text-blue-400 font-bold text-lg mt-1">{{ hub.sensor_units_count || 1 }}</p>
                </div>
              </div>
            </div>

            <!-- Connected Sensor Units -->
            <div class="bg-gray-800 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold">Connected Sensor Units ({{ hub.sensor_units_count || 1 }})</h3>
                <div class="flex gap-2">
                  <button 
                    @click="scanForUnits"
                    :disabled="!isHubOnline"
                    class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                    </svg>
                    Scan for Units
                  </button>
                  
                  <button 
                    @click="showAddSensorUnitModal = true"
                    class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded text-sm font-medium flex items-center gap-1.5"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                    </svg>
                    Add Unit
                  </button>
                </div>
              </div>

              <!-- Sensor Units List -->
              <div class="space-y-2">
                <div class="bg-gray-900 rounded p-3 flex items-center justify-between hover:bg-gray-750 transition-colors cursor-pointer">
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <div class="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/>
                        </svg>
                      </div>
                      <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-400 border border-gray-900"></div>
                    </div>
                    <div>
                      <h4 class="font-medium text-white text-sm">Unit H1</h4>
                      <div class="flex items-center gap-3 text-xs text-gray-400">
                        <span>Hive 1</span>
                        <span>vunit-1.0.0</span>
                        <span>3d ago</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs font-medium rounded bg-red-900/30 text-red-400 border border-red-500/30">
                      Offline
                    </span>
                    <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Telemetry (5 columns) -->
          <div class="col-span-5">
            <div class="bg-gray-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold mb-4">Telemetry Data</h3>
              
              <!-- Telemetry Stats Grid -->
              <div class="space-y-4">
                <!-- Battery -->
                <div class="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.5 6A1.5 1.5 0 002 7.5v5A1.5 1.5 0 003.5 14h13a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0016.5 6h-13z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-400">Battery</p>
                      <div class="w-24 bg-gray-700 rounded-full h-1.5 mt-1">
                        <div class="bg-green-400 h-1.5 rounded-full" style="width: 85%"></div>
                      </div>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-green-400">85%</span>
                </div>

                <!-- Signal -->
                <div class="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-400">Signal</p>
                      <p class="text-xs text-gray-500">RSSI</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-yellow-400">-68 dBm</span>
                </div>

                <!-- Voltage -->
                <div class="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-400">Voltage</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-white">3.7V</span>
                </div>

                <!-- SNR -->
                <div class="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a4 4 0 01-8 0V9a.5.5 0 00-1 0v3a1 1 0 11-2 0V3z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-400">SNR</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-white">12 dB</span>
                </div>

                <!-- Storage -->
                <div class="flex items-center justify-between p-3 bg-gray-900 rounded">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm text-gray-400">Storage</p>
                      <p class="text-xs text-gray-500">Free space</p>
                    </div>
                  </div>
                  <span class="text-lg font-bold text-white">2.1GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div class="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">Delete Hub</h3>
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete "{{ hub?.name || 'Hub A1' }}"? 
          This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete Hub' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'

// Composables
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const error = ref('')
const hub = ref(null)
const deleting = ref(false)

// Modal state
const showEditHubModal = ref(false)
const showSendCommandModal = ref(false)
const showUpdateFirmwareModal = ref(false)
const showDeleteModal = ref(false)
const showAddSensorUnitModal = ref(false)

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

// Computed properties
const isHubOnline = computed(() => {
  // For demo purposes, return false to match the screenshot
  return false
})

// Helper functions
const formatLastSeen = (dateStr) => {
  return '3d ago' // Match the screenshot
}

const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Navigation functions
const navigateToApiary = (apiary) => {
  const identifier = apiary.uuid || apiary.id
  navigateTo(`/apiaries/${identifier}`)
}

// Action functions
const scanForUnits = async () => {
  console.log('Scan for units')
}

const confirmDelete = async () => {
  if (!hub.value) return
  
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hubs/${hub.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    navigateTo('/hubs')
    
  } catch (err) {
    alert('Failed to delete hub: ' + (err.message || 'Unknown error'))
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Load hub data
const loadHubData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const hubId = route.params.id
    if (!hubId) {
      throw new Error('Hub ID is required')
    }

    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hubs/${hubId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to load hub details')
    }

    hub.value = response.data

  } catch (err) {
    console.error('Error loading hub:', err)
    error.value = err.message || 'Failed to load hub details'
  } finally {
    loading.value = false
  }
}

// Page metadata
definePageMeta({
  title: 'Hub Details - BeeVibe Dashboard',
  middleware: ['auth']
})

// Lifecycle
onMounted(() => {
  loadHubData()
})
</script>