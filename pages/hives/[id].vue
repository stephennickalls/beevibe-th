<template>
  <div class="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Sidebar Navigation -->
    <SidebarNavigation :alert-count="activeAlerts.length" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Mobile Navigation -->
      <MobileNavigation />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-400">Loading hive details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-900/30 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
          </svg>
          <h3 class="text-lg font-semibold mb-2">{{ errorTitle }}</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <NuxtLink to="/dashboard-v2" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            Back to Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Hive Details Content -->
      <div v-else class="space-y-6">
        <!-- Header with Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/dashboard-v2" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-2xl font-bold">{{ hive.name || `Hive ${hive.id}` }}</h1>
              <p class="text-gray-400">{{ hive.description || 'No description' }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <div :class="getHiveStatus(hive).color" class="w-3 h-3 rounded-full"></div>
              <span class="text-sm" :class="getHiveStatus(hive).textColor">{{ getHiveStatus(hive).status }}</span>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button @click="showEditModal = true" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              <span>Edit</span>
            </button>
            <button @click="showDeleteModal = true" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <!-- Hive Information and Sensors -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Hive Information -->
          <div class="bg-gray-900 rounded-2xl p-6">
            <h3 class="text-xl font-semibold mb-4">Hive Information</h3>
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-400">Name:</span>
                <span>{{ hive.name || 'Not set' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Description:</span>
                <span>{{ hive.description || 'Not set' }}</span>
              </div>
              <!-- Hive UUID with hide/reveal functionality -->
              <div class="flex justify-between items-center">
                <span class="text-gray-400">Hive UUID:</span>
                <div class="flex items-center space-x-2">
                  <span v-if="!showHiveUuid" class="font-mono text-sm">••••••••-••••-••••-••••-••••••••••••</span>
                  <span v-else class="font-mono text-sm break-all">{{ hive.uuid || 'Not set' }}</span>
                  <button 
                    @click="showHiveUuid = !showHiveUuid" 
                    class="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                    :title="showHiveUuid ? 'Hide UUID' : 'Show UUID'"
                  >
                    <svg v-if="showHiveUuid" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"/>
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </button>
                  <button 
                    v-if="showHiveUuid && hive.uuid" 
                    @click="copyToClipboard(hive.uuid, 'Hive UUID')"
                    class="text-gray-400 hover:text-white text-xs cursor-pointer"
                    title="Copy UUID"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Installation Date:</span>
                <span>{{ hive.installation_date || 'Not set' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Apiary:</span>
                <span>
                  {{ hive.apiary?.name || 'No apiary assigned' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Status:</span>
                <span :class="hive.is_active ? 'text-green-400' : 'text-red-400'">
                  {{ hive.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Created:</span>
                <span>{{ formatDate(hive.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Sensors -->
          <div class="bg-gray-900 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Sensors</h3>
              <button @click="showAssignSensorModal = true" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors cursor-pointer">
                Add Sensor
              </button>
            </div>
            
            <div class="space-y-3">
              <div v-if="hiveSensors.length === 0" class="text-center py-8 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
                <p class="text-sm">No sensors configured</p>
              </div>

              <!-- Sensor cards with action section -->
              <div v-for="sensor in hiveSensors" :key="sensor.id" class="bg-gray-800 rounded-lg overflow-hidden">
                <!-- Sensor content area (clickable) -->
                <div @click="openSensorDetailModal(sensor)" class="cursor-pointer">
                  <SensorListItem
                    :sensor="sensor"
                    mode="page"
                  />
                </div>
                
                <!-- Action buttons section -->
                <div class="flex justify-end space-x-2 px-4 pb-3 pt-2 border-t border-gray-700">
                  <button 
                    @click="openUnlinkSensorModal(sensor)" 
                    class="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                  <button 
                    @click="openSensorDetailModal(sensor)"
                    class="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-900/20 transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Hive Modal -->
      <HiveEditModal
        :show="showEditModal"
        :hive="hive"
        :updating="updating"
        @close="closeEditModal"
        @save="handleUpdateHive"
      />

      <!-- Delete Hive Modal -->
      <DeleteHiveModal
        :show="showDeleteModal"
        :hive="hive"
        :deleting="deleting"
        @close="closeDeleteModal"
        @delete="handleDeleteHive"
      />

      <!-- Assign Sensor Modal -->
      <AssignSensorModal
        :show="showAssignSensorModal"
        :unassigned-sensors="unassignedSensors"
        :assigning="assigningSensor"
        @close="closeAssignSensorModal"
        @assign="handleAssignSensor"
      />

      <!-- Unlink Sensor Modal Component -->
      <UnlinkSensorModal
        :show="showUnlinkSensorModal"
        :sensor="sensorToUnlink"
        :unlinking="unlinkingSensor"
        @close="closeUnlinkSensorModal"
        @unlink="handleUnlinkSensor"
      />

      <!-- Sensor Edit Modal -->
      <SensorEditModal
        :show="showSensorDetailModal"
        :sensor="selectedSensor"
        :available-hives="hivesWithSensorData"
        :updating="updatingSensor"
        @close="closeSensorDetailModal"
        @save="handleSensorSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import SensorEditModal from '~/components/SensorEditModal.vue'
import SensorListItem from '~/components/SensorListItem.vue'
import DeleteHiveModal from '~/components/DeleteHiveModal.vue'
import HiveEditModal from '~/components/HiveEditModal.vue'
import AssignSensorModal from '~/components/AssignSensorModal.vue'
import UnlinkSensorModal from '~/components/UnlinkSensorModal.vue'

// Route and navigation
const route = useRoute()
const hiveIdentifier = route.params.id

// Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Meta
definePageMeta({
  title: 'Hive Details - BeeVibe Dashboard',
  middleware: ['auth']
})

// Use centralized data composable
const {
  hivesWithSensorData,
  sensorsWithLatestReadings,
  loading,
  error,
  refreshData,
  clearError
} = useHiveData()

// Local reactive data
const hive = ref({})
const errorTitle = ref('Hive Not Found')
const activeAlerts = ref([])

// Modal states
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAssignSensorModal = ref(false)
const showSensorDetailModal = ref(false)
const showUnlinkSensorModal = ref(false)

// Loading states
const updating = ref(false)
const deleting = ref(false)
const assigningSensor = ref(false)
const updatingSensor = ref(false)
const unlinkingSensor = ref(false)

// UI states
const showHiveUuid = ref(false)

// Form data
const selectedSensor = ref(null)
const sensorToUnlink = ref(null)

// Computed properties
const hiveSensors = computed(() => {
  if (!hive.value?.id) return []
  return sensorsWithLatestReadings.value.filter(sensor => sensor.hive_id === hive.value.id)
})

const unassignedSensors = computed(() => {
  return sensorsWithLatestReadings.value.filter(sensor => !sensor.hive_id)
})

// Helper function to get auth token
const getAuthToken = async () => {
  if (!user.value) return null
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  } catch (err) {
    console.error('Error getting auth token:', err)
    return null
  }
}

// Validation function for UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Main load function using centralized data
const loadHiveData = async () => {
  clearError()
  
  try {
    // Validate UUID format
    if (!isValidUUID(hiveIdentifier)) {
      error.value = 'The hive link is invalid. Please check the URL or go back to your dashboard.'
      errorTitle.value = 'Invalid Hive Link'
      return
    }
    
    // Use centralized data refresh
    await refreshData()
    
    // Find the specific hive from centralized data
    const foundHive = hivesWithSensorData.value.find(h => 
      h.id === hiveIdentifier || h.uuid === hiveIdentifier
    )
    
    if (!foundHive) {
      error.value = 'This hive could not be found. It may have been deleted or you may not have access to it.'
      errorTitle.value = 'Hive Not Found'
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigateTo('/dashboard-v2')
      }, 3000)
      return
    }
    
    hive.value = foundHive
    console.log('Hive loaded successfully:', hive.value.name)
    
  } catch (err) {
    console.error('Error loading hive:', err)
    
    // Set user-friendly error message
    if (err.statusCode === 401) {
      error.value = 'Your session has expired. Please log in again.'
      errorTitle.value = 'Authentication Required'
    } else {
      error.value = err.message || 'Failed to load hive details'
      errorTitle.value = 'Error Loading Hive'
    }
  }
}

// Functions
const getHiveStatus = (hive) => {
  const sensors = hiveSensors.value
  
  if (!sensors || sensors.length === 0) {
    return { status: 'No Sensors', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  const onlineSensors = sensors.filter(s => s.is_online).length
  const totalSensors = sensors.length
  
  if (onlineSensors === 0) {
    return { status: 'Offline', color: 'bg-red-400', textColor: 'text-red-400' }
  } else if (onlineSensors < totalSensors) {
    return { status: 'Partial', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
  } else {
    return { status: 'Online', color: 'bg-green-400', textColor: 'text-green-400' }
  }
}

const formatDate = (date) => {
  if (!date) return 'Not set'
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Utility function for copying to clipboard
const copyToClipboard = async (text, type = 'text') => {
  try {
    await navigator.clipboard.writeText(text)
    console.log(`${type} copied to clipboard`)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Modal functions
const closeEditModal = () => {
  showEditModal.value = false
}

const closeAssignSensorModal = () => {
  showAssignSensorModal.value = false
}

const closeUnlinkSensorModal = () => {
  showUnlinkSensorModal.value = false
  sensorToUnlink.value = null
}

const closeSensorDetailModal = () => {
  selectedSensor.value = null
  showSensorDetailModal.value = false
}

const openSensorDetailModal = (sensor) => {
  selectedSensor.value = sensor
  showSensorDetailModal.value = true
}

const openUnlinkSensorModal = (sensor) => {
  sensorToUnlink.value = sensor
  showUnlinkSensorModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

// Handler functions following Action → Refresh → Close pattern
const handleUpdateHive = async (formData) => {
  if (updating.value || !user.value) return
  
  updating.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication required')
    
    const response = await $fetch(`/api/hives/${hiveIdentifier}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        name: formData.name.trim(),
        description: formData.description.trim(),
        installation_date: formData.installation_date,
        is_active: formData.is_active,
        apiary_id: formData.apiary_id || null
      }
    })
    
    if (response.error) throw new Error(response.error)
    
    console.log('Hive updated successfully')
    
    // 1. Refresh centralized data
    await refreshData()
    
    // 2. Update local hive data from centralized source
    const updatedHive = hivesWithSensorData.value.find(h => 
      h.id === hiveIdentifier || h.uuid === hiveIdentifier
    )
    if (updatedHive) {
      hive.value = updatedHive
    }
    
    // 3. Close modal
    closeEditModal()
    
  } catch (err) {
    console.error('Failed to update hive:', err)
    alert(err.message || 'Failed to update hive. Please try again.')
  } finally {
    updating.value = false
  }
}

const handleDeleteHive = async (hiveToDelete) => {
  if (deleting.value || !user.value) return
  
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication required')
    
    const response = await $fetch(`/api/hives/${hiveIdentifier}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.error) throw new Error(response.error)
    
    console.log('Hive deleted successfully')
    
    // Navigate to dashboard (no need to refresh data since we're leaving)
    navigateTo('/dashboard-v2')
    
  } catch (err) {
    console.error('Failed to delete hive:', err)
    alert(err.message || 'Failed to delete hive. Please try again.')
  } finally {
    deleting.value = false
  }
}

const handleAssignSensor = async (selectedSensorId) => {
  if (assigningSensor.value || !user.value || !selectedSensorId) return
  
  assigningSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication required')
    
    const response = await $fetch(`/api/sensors/${selectedSensorId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { hive_id: hive.value.id }
    })
    
    if (response.error) throw new Error(response.error)
    
    console.log('Sensor assigned successfully')
    
    // 1. Refresh centralized data
    await refreshData()
    
    // 2. Update local data from centralized source
    await loadHiveData()
    
    // 3. Close modal
    closeAssignSensorModal()
    
  } catch (err) {
    console.error('Failed to assign sensor:', err)
    alert(err.message || 'Failed to assign sensor. Please try again.')
  } finally {
    assigningSensor.value = false
  }
}

const handleUnlinkSensor = async (sensor) => {
  if (unlinkingSensor.value || !user.value || !sensor) return
  
  unlinkingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication required')
    
    const response = await $fetch(`/api/sensors/${sensor.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: { hive_id: null }
    })
    
    if (response.error) throw new Error(response.error)
    
    console.log('Sensor unlinked successfully')
    
    // 1. Refresh centralized data
    await refreshData()
    
    // 2. Update local data from centralized source
    await loadHiveData()
    
    // 3. Close modal
    closeUnlinkSensorModal()
    
  } catch (err) {
    console.error('Failed to unlink sensor:', err)
    alert(err.message || 'Failed to unlink sensor. Please try again.')
  } finally {
    unlinkingSensor.value = false
  }
}

const handleSensorSave = async (formData) => {
  if (updatingSensor.value || !user.value || !selectedSensor.value) return
  
  updatingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) throw new Error('Authentication required')
    
    const response = await $fetch(`/api/sensors/${selectedSensor.value.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        sensor_type: formData.sensor_type,
        name: formData.name.trim() || `${formData.sensor_type} Sensor`,
        model: formData.model.trim() || null,
        battery_level: formData.battery_level,
        is_online: formData.is_online,
        hive_id: formData.hive_id || null
      }
    })
    
    if (response.error) throw new Error(response.error)
    
    console.log('Sensor updated successfully')
    
    // 1. Refresh centralized data
    await refreshData()
    
    // 2. Update local data from centralized source
    await loadHiveData()
    
    // 3. Close modal
    closeSensorDetailModal()
    
  } catch (err) {
    console.error('Failed to update sensor:', err)
    alert(err.message || 'Failed to update sensor. Please try again.')
  } finally {
    updatingSensor.value = false
  }
}

// Lifecycle and watchers
onMounted(async () => {
  if (user.value) {
    await loadHiveData()
  }
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await loadHiveData()
  } else {
    navigateTo('/login')
  }
}, { immediate: false })

// Watch for changes in centralized data to update local hive
watch(hivesWithSensorData, (newHives) => {
  if (newHives && hive.value?.id) {
    const updatedHive = newHives.find(h => 
      h.id === hive.value.id || h.uuid === hive.value.uuid
    )
    if (updatedHive) {
      hive.value = updatedHive
    }
  }
}, { deep: true })
</script>

<style scoped>
/* Custom scrollbar for modals */
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: #6B7280;
  border-radius: 2px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Loading spinner animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transition animations */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>