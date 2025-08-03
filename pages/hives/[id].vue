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
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
              <button @click="showAddSensorModal = true" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors cursor-pointer">
                Add Sensor
              </button>
            </div>
            
            <div class="space-y-3">
              <div v-if="sensors.length === 0" class="text-center py-8 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
                </svg>
                <p class="text-sm">No sensors configured</p>
              </div>

              <!-- Sensor cards with action section -->
              <div v-for="sensor in sensorsWithActions" :key="sensor.id" class="bg-gray-800 rounded-lg overflow-hidden">
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
                    @click="openRemoveSensorModal(sensor)" 
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
        @delete="deleteHive"
      />

      <!-- Assign Sensor Modal -->
      <div v-if="showAddSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 class="text-xl font-semibold">Assign Sensor to Hive</h3>
            <button @click="closeAddSensorModal" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
              </svg>
            </button>
          </div>
          
          <!-- No Unassigned Sensors State -->
          <div v-if="unassignedSensors.length === 0" class="p-6">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              <h4 class="text-lg font-semibold mb-2">No Unassigned Sensors</h4>
              <p class="text-gray-400 mb-4">
                All sensors are currently assigned to hives. Create a new sensor first to assign it to this hive.
              </p>
              <div class="flex flex-col space-y-3">
                <NuxtLink 
                  to="/sensors" 
                  class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center"
                  @click="closeAddSensorModal"
                >
                  Go to Sensors Page
                </NuxtLink>
                <button 
                  @click="closeAddSensorModal" 
                  class="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Assign Sensor Form -->
          <div v-else>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Select Sensor to Assign</label>
                <select v-model="selectedSensorId" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="">Choose an unassigned sensor...</option>
                  <option v-for="sensor in unassignedSensors" :key="sensor.id" :value="sensor.id">
                    {{ sensor.name || `${sensor.sensor_type} Sensor` }} ({{ sensor.sensor_type }})
                  </option>
                </select>
              </div>

              <!-- Selected Sensor Details -->
              <div v-if="selectedSensorDetails" class="bg-gray-700 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Sensor Details</h4>
                <div class="space-y-1 text-sm text-gray-400">
                  <p><span class="text-gray-500">Type:</span> {{ selectedSensorDetails.sensor_type }}</p>
                  <p><span class="text-gray-500">Model:</span> {{ selectedSensorDetails.model || 'Not specified' }}</p>
                  <p><span class="text-gray-500">Battery:</span> {{ selectedSensorDetails.battery_level || 'Unknown' }}%</p>
                  <p><span class="text-gray-500">Status:</span> 
                    <span :class="selectedSensorDetails.is_online ? 'text-green-400' : 'text-red-400'">
                      {{ selectedSensorDetails.is_online ? 'Online' : 'Offline' }}
                    </span>
                  </p>
                  <p><span class="text-gray-500">Created:</span> {{ formatDate(selectedSensorDetails.created_at) }}</p>
                </div>
              </div>

              <!-- Info Message -->
              <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p class="text-blue-300 text-sm">
                  <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
                  </svg>
                  Only unassigned sensors are shown. To create a new sensor, visit the 
                  <NuxtLink to="/sensors" class="text-blue-400 hover:text-blue-300 underline">sensors page</NuxtLink>.
                </p>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 p-6 border-t border-gray-700">
              <button @click="closeAddSensorModal" class="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button 
                @click="assignSensorToHive" 
                :disabled="!selectedSensorId || assigningSensor" 
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg"
              >
                {{ assigningSensor ? 'Assigning...' : 'Assign Sensor' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Remove Sensor Modal -->
      <div v-if="showRemoveSensorModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-gray-800 rounded-lg w-full max-w-md">
          <div class="p-6">
            <div class="flex items-center space-x-3 mb-4">
              <svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
              </svg>
              <h3 class="text-lg font-semibold">Remove Sensor from Hive</h3>
            </div>
            
            <div class="mb-6">
              <p class="text-gray-300 mb-4">
                Are you sure you want to remove the sensor "{{ removeSensorForm.sensorToRemove?.name || `${removeSensorForm.sensorToRemove?.sensor_type} Sensor` }}" from this hive?
              </p>
              <p class="text-gray-300 mb-4">
                The sensor will be unlinked from this hive but will remain available to be assigned to another hive. The sensor and its historical data will not be deleted.
              </p>
              
              <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p class="text-yellow-300 text-sm mb-2">
                  To confirm removal, please type the sensor name below:
                </p>
                <p class="text-white font-mono text-sm mb-3 bg-gray-900 px-3 py-2 rounded">
                  {{ removeSensorForm.sensorToRemove?.name || `${removeSensorForm.sensorToRemove?.sensor_type} Sensor` }}
                </p>
                <input
                  v-model="removeSensorForm.confirmationName"
                  type="text"
                  placeholder="Type sensor name to confirm"
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  :class="{ 'border-yellow-500': removeSensorForm.confirmationName && !canRemoveSensor }"
                />
              </div>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button @click="closeRemoveSensorModal" class="px-4 py-2 text-gray-400 hover:text-white" :disabled="removingSensor">
                Cancel
              </button>
              <button 
                @click="removeSensorFromHive" 
                :disabled="!canRemoveSensor || removingSensor" 
                class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg v-if="removingSensor" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ removingSensor ? 'Removing...' : 'Remove from Hive' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensor Edit Modal -->
      <SensorEditModal
        :show="showSensorDetailModal"
        :sensor="selectedSensor"
        :available-hives="availableHives"
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

// Route and navigation
const route = useRoute()
const hiveIdentifier = route.params.id

// Composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Meta
definePageMeta({
  title: 'Hive Details - BeeVibe Dashboard',
  middleware: ['auth']
})

// Reactive data
const loading = ref(true)
const error = ref(null)
const errorTitle = ref('Hive Not Found')
const hive = ref({})
const sensors = ref([])
const activeAlerts = ref([])
const allSensors = ref([])
const availableHives = ref([])

// Modal states
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showAddSensorModal = ref(false)
const showSensorDetailModal = ref(false)
const showRemoveSensorModal = ref(false)

// Loading states
const updating = ref(false)
const deleting = ref(false)
const assigningSensor = ref(false)
const updatingSensor = ref(false)
const removingSensor = ref(false)

// UI states
const showHiveUuid = ref(false)

// Form data
const selectedSensorId = ref('')
const selectedSensor = ref(null)

const removeSensorForm = ref({
  sensorToRemove: null,
  confirmationName: ''
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

// Computed properties
const unassignedSensors = computed(() => {
  return allSensors.value.filter(sensor => !sensor.hive_id)
})

const selectedSensorDetails = computed(() => {
  if (!selectedSensorId.value) return null
  return allSensors.value.find(sensor => sensor.id === selectedSensorId.value)
})

const canRemoveSensor = computed(() => {
  if (!removeSensorForm.value.sensorToRemove) return false
  const sensorName = removeSensorForm.value.sensorToRemove.name || `${removeSensorForm.value.sensorToRemove.sensor_type} Sensor`
  return removeSensorForm.value.confirmationName.trim() === sensorName
})

// Computed property to ensure sensors have the required structure for SensorListItem
const sensorsWithActions = computed(() => {
  return sensors.value.map(sensor => ({
    ...sensor,
    // Ensure we have all required properties for SensorListItem
    name: sensor.name || `${sensor.sensor_type} Sensor`,
    sensor_type: sensor.sensor_type || 'unknown',
    is_online: sensor.is_online !== undefined ? sensor.is_online : false,
    battery_level: sensor.battery_level || null,
    model: sensor.model || null,
    // If we have recent sensor readings, structure them properly
    latest_reading: sensor.latest_reading ? {
      value: sensor.latest_reading.value,
      unit: sensor.latest_reading.unit,
      reading_time: sensor.latest_reading.reading_time || sensor.latest_reading.created_at,
      signal_strength: sensor.latest_reading.signal_strength
    } : null
  }))
})

// Functions
const getHiveStatus = (hive) => {
  if (!hive.sensors || hive.sensors.length === 0) {
    return { status: 'No Sensors', color: 'bg-gray-400', textColor: 'text-gray-400' }
  }
  
  const onlineSensors = hive.sensors.filter(s => s.is_online).length
  const totalSensors = hive.sensors.length
  
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

// Validation function for UUID format
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Main load function
const loadHive = async () => {
  if (!user.value) {
    error.value = 'Authentication required. Please log in.'
    errorTitle.value = 'Authentication Required'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('Loading hive with identifier:', hiveIdentifier)
    
    // Validate UUID format
    if (!isValidUUID(hiveIdentifier)) {
      throw new Error('Invalid hive identifier. Only UUID format is supported.')
    }
    
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const response = await $fetch(`/api/hives/${hiveIdentifier}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.error) {
      throw new Error(response.error)
    }
    
    if (!response.data) {
      throw new Error('Hive not found')
    }
    
    hive.value = response.data
    sensors.value = response.data.sensors || []
    console.log('Hive loaded successfully:', hive.value.name)
    
  } catch (err) {
    console.error('Error loading hive:', err)
    
    // Set user-friendly error message
    if (err.statusCode === 404 || err.message === 'Hive not found') {
      error.value = 'This hive could not be found. It may have been deleted or you may not have access to it.'
      errorTitle.value = 'Hive Not Found'
    } else if (err.statusCode === 401) {
      error.value = 'Your session has expired. Please log in again.'
      errorTitle.value = 'Authentication Required'
    } else if (err.message.includes('Invalid hive identifier')) {
      error.value = 'The hive link is invalid. Please check the URL or go back to your dashboard.'
      errorTitle.value = 'Invalid Hive Link'
    } else {
      error.value = err.message || 'Failed to load hive details'
      errorTitle.value = 'Error Loading Hive'
    }
    
    // If hive not found, redirect to dashboard after a delay
    if (err.statusCode === 404 || err.message === 'Hive not found') {
      setTimeout(() => {
        navigateTo('/dashboard-v2')
      }, 3000)
    }
  } finally {
    loading.value = false
  }
}

// Modal functions
const closeEditModal = () => {
  showEditModal.value = false
}

const closeAddSensorModal = () => {
  showAddSensorModal.value = false
  selectedSensorId.value = ''
}

const closeRemoveSensorModal = () => {
  showRemoveSensorModal.value = false
  removeSensorForm.value = {
    sensorToRemove: null,
    confirmationName: ''
  }
  removingSensor.value = false
}

const closeSensorDetailModal = () => {
  selectedSensor.value = null
  showSensorDetailModal.value = false
  updatingSensor.value = false
}

const openSensorDetailModal = (sensor) => {
  selectedSensor.value = sensor
  showSensorDetailModal.value = true
}

const openRemoveSensorModal = (sensor) => {
  removeSensorForm.value.sensorToRemove = sensor
  removeSensorForm.value.confirmationName = ''
  showRemoveSensorModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

// API functions
const fetchAllSensors = async () => {
  try {
    const token = await getAuthToken()
    if (!token) return
    
    const response = await $fetch('/api/sensors', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success && response.data) {
      allSensors.value = response.data
    }
  } catch (err) {
    console.error('Error fetching all sensors:', err)
  }
}

const fetchHives = async () => {
  try {
    const token = await getAuthToken()
    if (!token) return
    
    const response = await $fetch('/api/hives', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success && response.data) {
      availableHives.value = response.data
    }
  } catch (err) {
    console.error('Error fetching hives:', err)
  }
}

const fetchAlerts = async () => {
  try {
    const token = await getAuthToken()
    if (!token) return
    
    const response = await $fetch(`/api/alerts?hive_id=${hive.value.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success && response.data) {
      activeAlerts.value = response.data.filter(alert => !alert.resolved)
    }
  } catch (err) {
    console.error('Error fetching alerts:', err)
  }
}

// Handler for the HiveEditModal component
const handleUpdateHive = async (formData) => {
  updating.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/hives/${hiveIdentifier}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        name: formData.name.trim(),
        description: formData.description.trim(),
        installation_date: formData.installation_date,
        is_active: formData.is_active,
        apiary_id: formData.apiary_id || null
      }
    })
    
    if (response.success && response.data) {
      hive.value = { ...hive.value, ...response.data }
      showEditModal.value = false
    }
  } catch (err) {
    console.error('Error updating hive:', err)
    alert('Failed to update hive. Please try again.')
  } finally {
    updating.value = false
  }
}

// Handler for the DeleteHiveModal component
const deleteHive = async (hiveToDelete) => {
  deleting.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/hives/${hiveIdentifier}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.success) {
      navigateTo('/dashboard-v2')
    }
  } catch (err) {
    console.error('Error deleting hive:', err)
    alert('Failed to delete hive. Please try again.')
  } finally {
    deleting.value = false
  }
}

const assignSensorToHive = async () => {
  if (!selectedSensorId.value) return
  
  assigningSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/sensors/${selectedSensorId.value}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        hive_id: hive.value.id
      }
    })
    
    if (response.success && response.data) {
      // Add the assigned sensor to the hive's sensor list
      sensors.value.push(response.data)
      closeAddSensorModal()
      
      // Refresh the all sensors list to update unassigned sensors
      await fetchAllSensors()
    }
  } catch (err) {
    console.error('Error assigning sensor to hive:', err)
    alert('Failed to assign sensor to hive. Please try again.')
  } finally {
    assigningSensor.value = false
  }
}

const handleSensorSave = async (formData) => {
  if (!selectedSensor.value || updatingSensor.value) return
  
  updatingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/sensors/${selectedSensor.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        sensor_type: formData.sensor_type,
        name: formData.name.trim() || `${formData.sensor_type} Sensor`,
        model: formData.model.trim() || null,
        battery_level: formData.battery_level,
        is_online: formData.is_online,
        hive_id: formData.hive_id || null
      }
    })
    
    if (response.success && response.data) {
      // Update the sensor in the local array
      const sensorIndex = sensors.value.findIndex(s => s.id === selectedSensor.value.id)
      if (sensorIndex !== -1) {
        sensors.value[sensorIndex] = { ...sensors.value[sensorIndex], ...response.data }
      }
      closeSensorDetailModal()
    }
  } catch (err) {
    console.error('Error updating sensor:', err)
    alert('Failed to update sensor. Please try again.')
  } finally {
    updatingSensor.value = false
  }
}

const removeSensorFromHive = async () => {
  if (!canRemoveSensor.value || removingSensor.value) return
  
  removingSensor.value = true
  
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await $fetch(`/api/sensors/${removeSensorForm.value.sensorToRemove.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        hive_id: null // Set hive_id to null to unlink
      }
    })
    
    if (response.success) {
      sensors.value = sensors.value.filter(s => s.id !== removeSensorForm.value.sensorToRemove.id)
      closeRemoveSensorModal()
      
      // Refresh the all sensors list to update unassigned sensors
      await fetchAllSensors()
    }
  } catch (err) {
    console.error('Error removing sensor from hive:', err)
    alert('Failed to remove sensor from hive. Please try again.')
  } finally {
    removingSensor.value = false
  }
}

// Lifecycle and watchers
onMounted(async () => {
  if (user.value) {
    await loadHive()
    
    // Only fetch additional data if hive loaded successfully
    if (!error.value && hive.value.id) {
      await Promise.all([
        fetchAllSensors(),
        fetchHives(),
        fetchAlerts()
      ])
    }
  }
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await loadHive()
    
    // Only fetch additional data if hive loaded successfully
    if (!error.value && hive.value.id) {
      await Promise.all([
        fetchAllSensors(),
        fetchHives(),
        fetchAlerts()
      ])
    }
  } else {
    // Redirect to login if no user
    navigateTo('/login')
  }
}, { immediate: false })
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
</style>