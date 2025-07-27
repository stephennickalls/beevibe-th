<template>
  <div
    class="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors border border-gray-700 hover:border-gray-600"
  >
    <div class="flex items-center justify-between">
      <!-- Left Section: Main Info -->
      <div class="flex items-center space-x-4 flex-1">
        <!-- Sensor Icon & Status -->
        <div class="relative">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-700">
            <svg v-if="sensor.sensor_type === 'temperature'" class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.88 2.12z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'humidity'" class="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3s-6 5.419-6 8a6 6 0 1012 0c0-2.581-6-8-6-8z"/>
            </svg>
            <svg v-else-if="sensor.sensor_type === 'weight'" class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 48 50">
              <path d="M3.8267 49.0903C2.93437 48.8741 2.13088 48.4093 1.44276 47.7117C0.429767 46.6847 0 45.6519 0 44.2445C0 43.7521 0.673992 39.4787 2.11696 30.8218C3.28128 23.8366 4.30398 17.8184 4.38963 17.4481C4.7943 15.6984 6.08237 14.2863 7.78466 13.7262C8.37711 13.5312 8.64529 13.5157 12.0481 13.4783C14.0453 13.4556 15.6794 13.4193 15.6794 13.3959C15.6794 13.3732 15.5773 13.1491 15.4522 12.8996C14.3821 10.7618 14.2998 7.87953 15.2424 5.55942C16.1715 3.27304 18.2794 1.29654 20.6552 0.484173C25.6745 -1.23219 31.0758 1.774 32.3346 6.98465C32.7812 8.83322 32.5164 11.2325 31.682 12.8996C31.5569 13.1491 31.4548 13.3725 31.4548 13.3959C31.4548 13.4186 33.0888 13.4563 35.0861 13.4783C39.1807 13.5232 39.3969 13.5557 40.5519 14.303C41.7567 15.0823 42.4823 16.1939 42.7943 17.738C42.9009 18.2663 43.9212 24.29 45.0613 31.1241C46.4487 39.4407 47.1342 43.784 47.1342 44.2582C47.1342 45.6513 46.701 46.6881 45.6914 47.7117C44.9885 48.4242 44.1984 48.8744 43.2634 49.0948C42.3882 49.3011 4.67871 49.2959 3.8267 49.0903ZM24.4848 12.6335C26.0732 12.2198 27.1944 10.881 27.2975 9.27482C27.4384 7.07899 25.7594 5.28183 23.5672 5.28183C21.3664 5.28183 19.6954 7.07045 19.8368 9.27482C19.9385 10.8591 21.0559 12.2116 22.6076 12.6286C23.2987 12.8141 23.7856 12.8168 24.4848 12.6335Z"/>
            </svg>
            <!-- Default icon for any other sensor types -->
            <svg v-else class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <!-- Status Indicator -->
          <div :class="[
            'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900',
            sensor.is_online ? 'bg-green-400' : 'bg-red-400'
          ]"></div>
        </div>

        <!-- Sensor Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-white truncate">
              {{ sensor.name || `${formatSensorType(sensor.sensor_type)} Sensor` }}
            </h3>
            <!-- Sensor Type Badge with matching colors -->
            <span :class="[
              'px-2 py-0.5 text-xs font-medium rounded-full',
              getSensorTypeBadgeColor(sensor.sensor_type)
            ]">
              {{ formatSensorType(sensor.sensor_type) }}
            </span>
          </div>
          
          <div class="flex items-center gap-4 text-sm text-gray-400">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
              <span>{{ sensor.hives?.name || 'Unassigned' }}</span>
            </div>
            
            <div v-if="sensor.model" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>{{ sensor.model }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section: Status & Metrics -->
      <div class="flex items-center space-x-4">
        <!-- Latest Reading -->
        <div v-if="sensor.latest_reading" class="text-right">
          <div class="text-lg font-semibold text-white">
            {{ formatSensorValue(sensor.latest_reading.value, sensor.latest_reading.unit) }}
          </div>
          <div class="text-xs text-gray-400">
            {{ formatLastSeen(sensor.latest_reading.reading_time) }}
          </div>
        </div>

        <!-- Battery Level -->
        <div class="flex flex-col items-center">
          <div :class="[
            'text-xs font-medium mb-1',
            getBatteryColor(sensor.battery_level)
          ]">
            {{ sensor.battery_level || 0 }}%
          </div>
          <div class="w-6 h-10 bg-gray-700 rounded border flex flex-col justify-end">
            <div 
              :class="[
                'rounded transition-all duration-300',
                getBatteryFillColor(sensor.battery_level)
              ]"
              :style="{ height: `${sensor.battery_level || 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="flex flex-col items-end space-y-1">
          <span :class="[
            'px-2 py-1 text-xs font-medium rounded-full',
            sensor.is_online 
              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
              : 'bg-red-900/30 text-red-400 border border-red-500/30'
          ]">
            {{ sensor.is_online ? 'Online' : 'Offline' }}
          </span>
        </div>

        <!-- View Details Link -->
         <button 
          @click="handleViewDetails"
          class="text-blue-400 hover:text-blue-300 text-sm underline cursor-pointer transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  sensor: {
    type: Object,
    required: true
  }
})

// Events
const emit = defineEmits(['click'])

// Enhanced styling function for badges - only temperature, humidity, weight
const getSensorTypeBadgeColor = (type) => {
  const colors = {
    'temperature': 'bg-red-900/30 text-red-400 border border-red-500/30',
    'humidity': 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
    'weight': 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
  }
  return colors[type] || 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
}

// Battery color functions
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

const handleViewDetails = () => {
  console.log('SensorCard: Emitting sensor:', props.sensor)
  emit('click', props.sensor)
}

// Utility functions - simplified for only the three sensor types
const formatSensorType = (type) => {
  const labels = {
    'temperature': 'Temperature',
    'humidity': 'Humidity', 
    'weight': 'Weight Scale'
  }
  return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
}

const formatSensorValue = (value, unit) => {
  if (value === null || value === undefined) return 'No data'
  
  const numValue = parseFloat(value)
  const type = props.sensor.sensor_type
  
  switch (type) {
    case 'temperature':
      return `${numValue.toFixed(1)}°C`
    case 'humidity':
      return `${numValue.toFixed(1)}%`
    case 'weight':
      return `${(numValue / 1000).toFixed(1)}kg`
    default:
      return unit ? `${numValue.toFixed(1)}${unit}` : numValue.toFixed(1)
  }
}

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Never'
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
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
.bg-green-400 {
  background-color: #4ade80;
}

.bg-red-400 {
  background-color: #f87171;
}

.bg-yellow-400 {
  background-color: #facc15;
}

.text-green-400 {
  color: #4ade80;
}

.text-yellow-400 {
  color: #facc15;
}

.text-red-400 {
  color: #f87171;
}

.text-blue-400 {
  color: #60a5fa;
}

.text-gray-400 {
  color: #9ca3af;
}

/* Background colors */
.bg-gray-900 {
  background-color: #111827;
}

.bg-gray-800 {
  background-color: #1f2937;
}

.bg-gray-700 {
  background-color: #374151;
}

.border-gray-700 {
  border-color: #374151;
}

.border-gray-600 {
  border-color: #4b5563;
}

/* Badge backgrounds with opacity - only for the three sensor types */
.bg-red-900\/30 {
  background-color: rgba(127, 29, 29, 0.3);
}

.bg-blue-900\/30 {
  background-color: rgba(30, 58, 138, 0.3);
}

.bg-yellow-900\/30 {
  background-color: rgba(113, 63, 18, 0.3);
}

.bg-gray-900\/30 {
  background-color: rgba(17, 24, 39, 0.3);
}

/* Border colors with opacity - only for the three sensor types */
.border-red-500\/30 {
  border-color: rgba(239, 68, 68, 0.3);
}

.border-blue-500\/30 {
  border-color: rgba(59, 130, 246, 0.3);
}

.border-yellow-500\/30 {
  border-color: rgba(234, 179, 8, 0.3);
}

.border-gray-500\/30 {
  border-color: rgba(107, 114, 128, 0.3);
}
</style>