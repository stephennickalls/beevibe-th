<template>
  <div
    class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer"
    @click="handleViewDetails"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section: Main Info -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- Node Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <!-- ESP32 Node Icon -->
            <svg class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM8 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900',
            isOnline ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
        </div>

        <!-- Node Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-white truncate">
              {{ sensorNode.name }}
            </h3>
            <!-- Node Type Badge -->
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/30">
              ESP32 Node
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <!-- Hive Assignment -->
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>{{ assignedHive?.name || 'Unassigned' }}</span>
            </div>
            
            <!-- Connected Sensors -->
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>{{ sensorsCount }} sensors</span>
            </div>

            <!-- Firmware Version -->
            <div v-if="sensorNode.firmware_version" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>v{{ sensorNode.firmware_version }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Status & Metrics -->
      <div class="flex items-center space-x-4">
        <!-- Last Seen -->
        <div class="text-right">
          <div class="text-sm font-medium text-white">
            Last Seen
          </div>
          <div class="text-xs text-gray-400">
            {{ formatLastSeen(sensorNode.last_seen) }}
          </div>
        </div>

        <!-- Telemetry Row -->
        <div class="flex gap-2 min-w-[200px]">
          <!-- Battery Level -->
          <div class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div :class="[
              'text-xs font-medium mb-1',
              getBatteryColor(batteryLevel)
            ]">
              {{ batteryLevel || 0 }}%
            </div>
            <div class="w-4 h-6 bg-gray-600 rounded border flex flex-col justify-end">
              <div 
                :class="[
                  'rounded transition-all duration-300',
                  getBatteryFillColor(batteryLevel)
                ]"
                :style="{ height: `${batteryLevel || 0}%` }"
              ></div>
            </div>
          </div>

          <!-- Signal Strength -->
          <div class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-gray-400">
              Signal
            </div>
            <div :class="[
              'text-xs font-medium',
              getSignalColor(signalStrength)
            ]">
              {{ signalStrength || 'N/A' }}
            </div>
          </div>

          <!-- Voltage (if available) -->
          <div v-if="sensorNode.voltage" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-blue-400">
              Voltage
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ sensorNode.voltage }}V
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <!-- Assign to Hive Button -->
          <button 
            v-if="!sensorNode.hive_id && availableHives.length > 0"
            @click.stop="$emit('assign-to-hive', sensorNode)"
            class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Assign
          </button>
          
          <!-- Remove Button -->
          <button 
            @click.stop="$emit('remove-node', sensorNode)"
            class="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Remove
          </button>
        </div>

        <!-- Status Badge -->
        <div class="flex flex-col items-end space-y-1">
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            isOnline 
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-red-900/30 text-red-400 border border-red-500/30'
          ]">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

// Computed Properties
const assignedHive = computed(() => {
  return props.sensorNode.hive
})

const sensorsCount = computed(() => {
  return props.sensorNode.sensors?.length || 0
})

const batteryLevel = computed(() => {
  return props.sensorNode.battery_level || 0
})

const signalStrength = computed(() => {
  return props.sensorNode.signal_strength || 0
})

const isOnline = computed(() => {
  if (!props.sensorNode.last_seen) return false
  const lastSeen = new Date(props.sensorNode.last_seen).getTime()
  const now = Date.now()
  return now - lastSeen < 5 * 60 * 1000 // 5 minutes
})

// Helper functions
const getBatteryColor = (level) => {
  if (!level) return 'text-gray-400'
  if (level > 50) return 'text-green-400'
  if (level > 20) return 'text-yellow-400'
  return 'text-red-400'
}

const getBatteryFillColor = (level) => {
  if (level >= 50) return 'bg-green-400'
  if (level >= 20) return 'bg-yellow-400'
  return 'bg-red-400'
}

const getSignalColor = (rssi) => {
  if (!rssi) return 'text-gray-400'
  if (rssi > -60) return 'text-green-400'
  if (rssi > -80) return 'text-yellow-400'
  return 'text-red-400'
}

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
const handleViewDetails = () => {
  emit('view-details', props.sensorNode)
}
</script>

<style scoped>
/* Transition effects */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Hover effects */
.cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Status indicator colors */
.bg-green-400 { background-color: #4ade80; }
.bg-yellow-400{ background-color: #facc15; }
.bg-red-400   { background-color: #f87171; }

.text-green-400  { color: #4ade80; }
.text-yellow-400 { color: #facc15; }
.text-red-400    { color: #f87171; }
.text-blue-400   { color: #60a5fa; }
.text-gray-400   { color: #9ca3af; }

/* Background colors */
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }

.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }

/* Badge backgrounds with opacity */
.bg-blue-900\/30  { background-color: rgba(30, 58, 138, 0.3); }
.bg-green-900\/30 { background-color: rgba(20, 83, 45, 0.3); }
.bg-red-900\/30   { background-color: rgba(127, 29, 29, 0.3); }

/* Border colors with opacity */
.border-blue-500\/30  { border-color: rgba(59, 130, 246, 0.3); }
.border-green-500\/30 { border-color: rgba(34, 197, 94, 0.3); }
.border-red-500\/30   { border-color: rgba(239, 68, 68, 0.3); }
</style>