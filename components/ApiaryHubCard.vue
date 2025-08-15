<template>
  <div
    class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-700 hover:border-gray-600 cursor-pointer"
    @click="handleViewDetails"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section: Main Info -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- Hub Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <!-- Updated Hub/Gateway Icon with correct SVG -->
            <svg class="w-6 h-6 text-yellow-400" viewBox="0 0 694 825" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M346.5 293L449.99 352.75V472.25L346.5 532L243.01 472.25V352.75L346.5 293Z" fill="currentColor"/>
              <path d="M493.885 327.195V496.804L347 581.607L200.115 496.804V327.195L347 242.392L493.885 327.195Z" stroke="currentColor" stroke-width="18" fill="none"/>
              <path d="M381.568 671.782L415.75 730.987L381.568 790.191L313.204 790.191L279.023 730.987L313.204 671.782L381.568 671.782Z" fill="currentColor"/>
              <path d="M359.281 586.24C359.69 579.902 354.884 574.433 348.546 574.024C342.207 573.615 336.738 578.422 336.329 584.76L347.805 585.5L359.281 586.24ZM336.306 725.592L336.398 737.092L359.397 736.907L359.305 725.408L347.805 725.5L336.306 725.592ZM347.805 585.5L336.329 584.76C335.494 597.707 335.975 684.473 336.306 725.592L347.805 725.5L359.305 725.408C358.968 683.527 358.517 598.093 359.281 586.24L347.805 585.5Z" fill="currentColor"/>
              <path d="M382.568 152.591L416.75 93.3862L382.568 34.1817L314.204 34.1817L280.023 93.3862L314.204 152.591L382.568 152.591Z" fill="currentColor"/>
              <path d="M360.281 238.133C360.69 244.471 355.884 249.94 349.546 250.349C343.207 250.758 337.738 245.952 337.329 239.613L348.805 238.873L360.281 238.133ZM337.306 98.7807L337.398 87.2811L360.397 87.4658L360.305 98.9654L348.805 98.873L337.306 98.7807ZM348.805 238.873L337.329 239.613C336.494 226.666 336.975 139.9 337.306 98.7807L348.805 98.873L360.305 98.9654C359.968 140.846 359.517 226.28 360.281 238.133L348.805 238.873Z" fill="currentColor"/>
              <path d="M556.325 250.568L590.507 191.363L658.87 191.363L693.052 250.568L658.87 309.772L590.507 309.772L556.325 250.568Z" fill="currentColor"/>
              <path d="M493.387 312.64C487.693 315.455 485.36 322.352 488.175 328.045C490.99 333.739 497.887 336.072 503.58 333.257L498.484 322.949L493.387 312.64ZM625.557 262.861L635.47 257.031L623.81 237.206L613.897 243.036L619.727 252.949L625.557 262.861ZM498.484 322.949L503.58 333.257C515.211 327.507 590.111 283.707 625.557 262.861L619.727 252.949L613.897 243.036C577.796 264.267 504.034 307.375 493.387 312.64L498.484 322.949Z" fill="currentColor"/>
              <path d="M140.932 254.569L106.75 195.364L38.3863 195.364L4.20456 254.569L38.3863 313.773L106.75 313.773L140.932 254.569Z" fill="currentColor"/>
              <path d="M203.87 316.64C209.563 319.455 211.897 326.353 209.082 332.046C206.267 337.74 199.369 340.073 193.676 337.258L198.773 326.949L203.87 316.64ZM71.6995 266.862L61.7867 261.032L73.4463 241.207L83.3591 247.036L77.5293 256.949L71.6995 266.862ZM198.773 326.949L193.676 337.258C182.046 331.508 107.145 287.708 71.6995 266.862L77.5293 256.949L83.3591 247.036C119.46 268.268 193.222 311.376 203.87 316.64L198.773 326.949Z" fill="currentColor"/>
              <path d="M556.325 572.618L590.507 631.823L658.87 631.823L693.052 572.618L658.87 513.414L590.507 513.414L556.325 572.618Z" fill="currentColor"/>
              <path d="M493.387 510.547C487.693 507.732 485.36 500.834 488.175 495.141C490.99 489.447 497.887 487.114 503.58 489.929L498.484 500.238L493.387 510.547ZM625.557 560.325L635.47 566.155L623.81 585.98L613.897 580.151L619.727 570.238L625.557 560.325ZM498.484 500.238L503.58 489.929C515.211 495.679 590.111 539.479 625.557 560.325L619.727 570.238L613.897 580.151C577.796 558.919 504.034 515.811 493.387 510.547L498.484 500.238Z" fill="currentColor"/>
              <path d="M136.931 573.618L102.75 632.823L34.3862 632.823L0.204471 573.618L34.3862 514.414L102.75 514.414L136.931 573.618Z" fill="currentColor"/>
              <path d="M199.87 511.547C205.563 508.732 207.896 501.834 205.082 496.141C202.267 490.447 195.369 488.114 189.676 490.929L194.773 501.238L199.87 511.547ZM67.6993 561.325L57.7866 567.155L69.4462 586.98L79.359 581.151L73.5292 571.238L67.6993 561.325ZM194.773 501.238L189.676 490.929C178.046 496.679 103.145 540.479 67.6993 561.325L73.5292 571.238L79.359 581.151C115.46 559.919 189.222 516.811 199.87 511.547L194.773 501.238Z" fill="currentColor"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900',
            isHubOnline ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
        </div>

        <!-- Hub Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-white truncate">
              {{ hub.name }}
            </h3>
            <!-- Hub Type Badge - Updated to use yellow -->
            <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-500/30">
              ESP32 Hub
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <!-- Apiary Assignment -->
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>{{ hub.apiary?.name || 'Unassigned' }}</span>
            </div>
            
            <!-- Connected Sensor Units -->
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072a1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 8a2 2 0 100 4 2 2 0 000-4z"/>
              </svg>
              <span>{{ hub.sensor_units_count || 0 }} units</span>
            </div>

            <!-- Firmware Version -->
            <div v-if="hub.firmware_version" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>v{{ hub.firmware_version }}</span>
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
            {{ formatLastSeen(hub.last_seen) }}
          </div>
        </div>

        <!-- Telemetry Row -->
        <div v-if="hub.telemetry" class="flex gap-2 min-w-[200px]">
          <!-- Battery Level -->
          <div class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div :class="[
              'text-xs font-medium mb-1',
              getBatteryColor(hub.telemetry.battery_level)
            ]">
              {{ hub.telemetry.battery_level || 0 }}%
            </div>
            <div class="w-4 h-6 bg-gray-600 rounded border flex flex-col justify-end">
              <div 
                :class="[
                  'rounded transition-all duration-300',
                  getBatteryFillColor(hub.telemetry.battery_level)
                ]"
                :style="{ height: `${hub.telemetry.battery_level || 0}%` }"
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
              getSignalColor(hub.telemetry.rssi)
            ]">
              {{ hub.telemetry.rssi || 'N/A' }}
            </div>
          </div>

          <!-- Voltage (if available) -->
          <div v-if="hub.telemetry.voltage" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-blue-400">
              Voltage
            </div>
            <div class="text-xs text-gray-300 font-medium">
              {{ hub.telemetry.voltage }}V
            </div>
          </div>

          <!-- Storage (if available) -->
          <div v-if="hub.telemetry.storage_free_bytes" class="flex flex-col items-center p-2 bg-gray-700 rounded min-w-[60px]">
            <div class="text-xs font-medium mb-1 text-indigo-400">
              Storage
            </div>
            <div class="text-xs text-gray-300">
              {{ formatStorage(hub.telemetry.storage_free_bytes) }}
            </div>
          </div>
        </div>

        <!-- Pending Commands Indicator -->
        <div v-if="hub.pending_commands_count > 0" class="flex flex-col items-center">
          <div class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
            <span class="text-xs font-bold text-white">{{ hub.pending_commands_count }}</span>
          </div>
          <div class="text-xs text-orange-400 mt-1">
            Pending
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex flex-col items-end space-y-1">
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            isHubOnline 
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-red-900/30 text-red-400 border border-red-500/30'
          ]">
            {{ isHubOnline ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  hub: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click'])

// Computed properties
const isHubOnline = computed(() => {
  if (!props.hub.last_seen) return false
  const lastSeen = new Date(props.hub.last_seen).getTime()
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

const formatStorage = (bytes) => {
  if (!bytes) return 'N/A'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)}MB`
}

// Event handlers
const handleViewDetails = () => {
  emit('click', props.hub)
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
.text-indigo-400 { color: #818cf8; }
.text-orange-400 { color: #fb923c; }
.text-gray-400   { color: #9ca3af; }

/* Background colors */
.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }

.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }

/* Badge backgrounds with opacity */
.bg-yellow-900\/30 { background-color: rgba(113, 63, 18, 0.3); }
.bg-green-900\/30  { background-color: rgba(20, 83, 45, 0.3); }
.bg-red-900\/30    { background-color: rgba(127, 29, 29, 0.3); }

/* Border colors with opacity */
.border-yellow-500\/30 { border-color: rgba(234, 179, 8, 0.3); }
.border-green-500\/30  { border-color: rgba(34, 197, 94, 0.3); }
.border-red-500\/30    { border-color: rgba(239, 68, 68, 0.3); }
</style>