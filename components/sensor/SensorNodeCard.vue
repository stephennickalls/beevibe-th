<template>
  <div class="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
    <!-- Single Row Layout -->
    <div class="flex items-center justify-between">
      <!-- Left Section: Node Icon & Info -->
      <div class="flex items-center gap-4">
        <!-- Node Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-3 h-3 rounded-full border border-gray-900',
            statusColor
          ]"></div>
        </div>

        <!-- Node Details -->
        <div class="flex items-center gap-6">
          <!-- Main Info -->
          <div>
            <h4 class="font-semibold text-white text-lg">{{ sensorNode.name }}</h4>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span>{{ assignedHive ? assignedHive.name : 'Unassigned' }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                <span>{{ sensorsCount }} sensors</span>
              </div>
              <div v-if="sensorNode.firmware_version" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
                <span>v{{ sensorNode.firmware_version }}</span>
              </div>
            </div>
          </div>

          <!-- Type Badge -->
          <span class="px-3 py-1 text-sm font-medium rounded-full bg-yellow-900/40 text-yellow-400 border border-yellow-500/40">
            ESP32 Node
          </span>
        </div>
      </div>

      <!-- Right Section: Status & Metrics -->
      <div class="flex items-center gap-6">
        <!-- Last Seen -->
        <div class="text-center">
          <div class="text-sm text-gray-400">Last Seen</div>
          <div class="text-white font-medium">{{ formatLastSeen(sensorNode.last_seen) }}</div>
        </div>

        <!-- Battery Level -->
        <div class="text-center">
          <div class="text-sm text-gray-400">Battery</div>
          <div :class="[
            'text-lg font-bold',
            batteryColor
          ]">
            {{ batteryLevel }}%
          </div>
          <div class="w-16 bg-gray-700 rounded-full h-2 mt-1">
            <div 
              :class="[
                'h-2 rounded-full transition-all duration-300',
                batteryLevel > 60 ? 'bg-green-400' : batteryLevel > 30 ? 'bg-yellow-400' : 'bg-red-400'
              ]"
              :style="{ width: `${batteryLevel}%` }"
            ></div>
          </div>
        </div>

        <!-- Signal Strength -->
        <div class="text-center">
          <div class="text-sm text-gray-400">Signal</div>
          <div class="flex items-center justify-center gap-1 mt-1">
            <div v-for="bar in 4" :key="bar" :class="[
              'w-1 h-4 rounded-sm',
              signalStrength >= (bar * 25) ? 'bg-green-400' : 'bg-gray-600'
            ]"></div>
          </div>
        </div>

        <!-- Voltage (if available) -->
        <div v-if="sensorNode.voltage" class="text-center">
          <div class="text-sm text-gray-400">Voltage</div>
          <div class="text-white font-medium">{{ sensorNode.voltage }}V</div>
        </div>

        <!-- Status Badge -->
        <div class="text-center">
          <span :class="[
            'px-3 py-1 text-sm font-medium rounded-full',
            isOnline ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'
          ]">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>

        <!-- Actions Dropdown -->
        <div class="relative">
          <button 
            @click="showDropdown = !showDropdown"
            class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
          
          <div v-if="showDropdown" class="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            <button 
              @click="handleViewDetails"
              class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg"
            >
              View Details
            </button>
            <button 
              @click="handleAssign"
              v-if="!assignedHive && availableHives.length > 0"
              class="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-700"
            >
              Assign to Hive
            </button>
            <button 
              @click="handleUnassign"
              v-else-if="assignedHive"
              class="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-gray-700"
            >
              Unassign
            </button>
            <button 
              @click="handleRemove"
              class="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 rounded-b-lg border-t border-gray-700"
            >
              Remove Node
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment Row (when unassigned and available hives) -->
    <div v-if="!assignedHive && availableHives.length > 0 && showAssignmentRow" class="mt-4 pt-4 border-t border-gray-700">
      <div class="flex items-center gap-3">
        <label class="text-sm font-medium text-gray-300">Assign to Hive:</label>
        <select 
          v-model="selectedHiveId"
          class="flex-1 max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Select a hive...</option>
          <option 
            v-for="hive in availableHives" 
            :key="hive.id" 
            :value="hive.id"
          >
            {{ hive.name }}
          </option>
        </select>
        <button 
          @click="confirmAssignment"
          :disabled="!selectedHiveId"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          Assign
        </button>
        <button 
          @click="showAssignmentRow = false"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  sensorNode: {
    type: Object,
    required: true
  },
  availableHives: {
    type: Array,
    default: () => []
  }
})

// Events
const emit = defineEmits(['assign-to-hive', 'view-details', 'remove-node'])

// Reactive data
const showDropdown = ref(false)
const selectedHiveId = ref('')
const showAssignmentRow = ref(false)

// Computed properties
const assignedHive = computed(() => {
  return props.sensorNode.hive || null
})

const sensorsCount = computed(() => {
  return props.sensorNode.sensors?.length || 0
})

const batteryLevel = computed(() => {
  return props.sensorNode.battery_level || 0
})

const batteryColor = computed(() => {
  const level = batteryLevel.value
  if (level > 60) return 'text-green-400'
  if (level > 30) return 'text-yellow-400'
  return 'text-red-400'
})

const signalStrength = computed(() => {
  // Convert RSSI or signal strength to percentage (0-100)
  const rssi = props.sensorNode.rssi || -100
  return Math.max(0, Math.min(100, (rssi + 100) * 2))
})

const statusColor = computed(() => {
  if (!props.sensorNode.last_seen) return 'bg-gray-400'
  
  const lastSeen = new Date(props.sensorNode.last_seen)
  const now = new Date()
  const diffMinutes = (now - lastSeen) / (1000 * 60)
  
  if (diffMinutes < 10) return 'bg-green-400'  // Online
  if (diffMinutes < 60) return 'bg-yellow-400' // Warning
  return 'bg-red-400' // Offline
})

const isOnline = computed(() => {
  if (!props.sensorNode.last_seen) return false
  
  const lastSeen = new Date(props.sensorNode.last_seen)
  const now = new Date()
  const diffMinutes = (now - lastSeen) / (1000 * 60)
  
  return diffMinutes < 10
})

// Helper functions
const formatLastSeen = (dateStr) => {
  if (!dateStr) return 'Never'
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Event handlers
const handleAssign = () => {
  showAssignmentRow.value = true
  showDropdown.value = false
}

const confirmAssignment = () => {
  if (selectedHiveId.value) {
    emit('assign-to-hive', props.sensorNode.id, selectedHiveId.value)
    selectedHiveId.value = ''
    showAssignmentRow.value = false
  }
}

const handleUnassign = () => {
  emit('assign-to-hive', props.sensorNode.id, null)
  showDropdown.value = false
}

const handleViewDetails = () => {
  emit('view-details', props.sensorNode)
  showDropdown.value = false
}

const handleRemove = () => {
  emit('remove-node', props.sensorNode)
  showDropdown.value = false
}

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showDropdown.value = false
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>